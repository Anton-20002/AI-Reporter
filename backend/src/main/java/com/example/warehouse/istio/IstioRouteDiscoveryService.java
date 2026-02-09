package com.example.warehouse.istio;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class IstioRouteDiscoveryService {

    private final ObjectMapper objectMapper;

    public IstioRouteDiscoveryService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public List<IstioRouteDto> discoverRoutes(String namespaceFilter) {
        try {
            Map<String, Integer> servicePorts = loadServicePorts(namespaceFilter);
            List<IstioRouteDto> routes = new ArrayList<>();

            routes.addAll(loadVirtualServiceRoutes(namespaceFilter, servicePorts));
            routes.addAll(loadServiceFallbackRoutes(namespaceFilter, servicePorts));

            return routes.stream().sorted(Comparator
                    .comparing(IstioRouteDto::namespace)
                    .thenComparing(IstioRouteDto::service)
                    .thenComparing(IstioRouteDto::host)
                    .thenComparing(IstioRouteDto::path))
                    .toList();
        } catch (IOException | InterruptedException e) {
            throw new IllegalStateException("Не удалось прочитать роуты из Kubernetes/Istio: " + e.getMessage(), e);
        }
    }

    private Map<String, Integer> loadServicePorts(String namespaceFilter) throws IOException, InterruptedException {
        JsonNode root = runKubectlJson("get", "svc", resolveNamespaceArg(namespaceFilter), "-o", "json");
        Map<String, Integer> ports = new HashMap<>();

        for (JsonNode item : root.path("items")) {
            String namespace = item.path("metadata").path("namespace").asText("default");
            String name = item.path("metadata").path("name").asText();
            int port = item.path("spec").path("ports").isArray() && !item.path("spec").path("ports").isEmpty()
                    ? item.path("spec").path("ports").get(0).path("port").asInt(80)
                    : 80;

            ports.put(namespace + "/" + name, port);
            ports.put(name, port);
            ports.put(name + "." + namespace, port);
            ports.put(name + "." + namespace + ".svc.cluster.local", port);
        }

        return ports;
    }

    private List<IstioRouteDto> loadVirtualServiceRoutes(String namespaceFilter, Map<String, Integer> servicePorts)
            throws IOException, InterruptedException {
        JsonNode root = runKubectlJson("get", "virtualservice", resolveNamespaceArg(namespaceFilter), "-o", "json");
        List<IstioRouteDto> routes = new ArrayList<>();

        for (JsonNode item : root.path("items")) {
            String namespace = item.path("metadata").path("namespace").asText("default");
            JsonNode spec = item.path("spec");
            List<String> gateways = readTextArray(spec.path("gateways"));
            if (gateways.isEmpty()) {
                gateways = List.of("mesh");
            }

            List<String> hosts = readTextArray(spec.path("hosts"));
            if (hosts.isEmpty()) {
                hosts = List.of("*");
            }

            for (JsonNode httpRoute : spec.path("http")) {
                List<String> paths = extractPaths(httpRoute.path("match"));
                if (paths.isEmpty()) {
                    paths = List.of("/");
                }

                for (JsonNode route : httpRoute.path("route")) {
                    JsonNode destination = route.path("destination");
                    String serviceHost = destination.path("host").asText("unknown");
                    int port = destination.path("port").path("number").asInt(resolvePort(serviceHost, namespace, servicePorts));

                    for (String host : hosts) {
                        for (String gateway : gateways) {
                            for (String path : paths) {
                                routes.add(new IstioRouteDto(
                                        namespace,
                                        extractServiceName(serviceHost),
                                        host,
                                        port,
                                        gateway.equals("mesh") ? "HTTP" : "HTTP/INGRESS",
                                        gateway,
                                        path,
                                        "VirtualService",
                                        gateway.equals("mesh")
                                ));
                            }
                        }
                    }
                }
            }
        }

        return routes;
    }

    private List<IstioRouteDto> loadServiceFallbackRoutes(String namespaceFilter, Map<String, Integer> servicePorts)
            throws IOException, InterruptedException {
        JsonNode root = runKubectlJson("get", "svc", resolveNamespaceArg(namespaceFilter), "-o", "json");
        List<IstioRouteDto> routes = new ArrayList<>();

        for (JsonNode item : root.path("items")) {
            String namespace = item.path("metadata").path("namespace").asText("default");
            String serviceName = item.path("metadata").path("name").asText();
            String host = serviceName + "." + namespace + ".svc.cluster.local";
            int port = resolvePort(host, namespace, servicePorts);

            routes.add(new IstioRouteDto(
                    namespace,
                    serviceName,
                    host,
                    port,
                    "HTTP",
                    "mesh",
                    "/",
                    "KubernetesService",
                    true
            ));
        }

        return routes;
    }

    private List<String> extractPaths(JsonNode matchArray) {
        List<String> paths = new ArrayList<>();
        for (JsonNode match : matchArray) {
            if (match.path("uri").has("exact")) {
                paths.add(match.path("uri").path("exact").asText());
            } else if (match.path("uri").has("prefix")) {
                paths.add(match.path("uri").path("prefix").asText());
            } else if (match.path("uri").has("regex")) {
                paths.add("regex:" + match.path("uri").path("regex").asText());
            }
        }
        return paths;
    }

    private int resolvePort(String serviceHost, String namespace, Map<String, Integer> servicePorts) {
        if (servicePorts.containsKey(serviceHost)) {
            return servicePorts.get(serviceHost);
        }

        String plainService = extractServiceName(serviceHost);
        if (servicePorts.containsKey(namespace + "/" + plainService)) {
            return servicePorts.get(namespace + "/" + plainService);
        }

        return 80;
    }

    private String extractServiceName(String serviceHost) {
        if (!serviceHost.contains(".")) {
            return serviceHost;
        }
        return serviceHost.split("\\.")[0];
    }

    private List<String> readTextArray(JsonNode node) {
        if (!node.isArray()) {
            return List.of();
        }

        List<String> values = new ArrayList<>();
        for (JsonNode child : node) {
            values.add(child.asText());
        }
        return values;
    }

    private JsonNode runKubectlJson(String... args) throws IOException, InterruptedException {
        List<String> command = new ArrayList<>();
        command.add("kubectl");
        command.addAll(Arrays.asList(args));

        Process process = new ProcessBuilder(command).start();

        String output;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
            output = reader.lines().reduce("", (acc, line) -> acc + line + "\n");
        }

        String errors;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream(), StandardCharsets.UTF_8))) {
            errors = reader.lines().reduce("", (acc, line) -> acc + line + "\n");
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            throw new IOException(errors.isBlank() ? "kubectl завершился с ошибкой " + exitCode : errors.trim());
        }

        return objectMapper.readTree(output);
    }

    private String resolveNamespaceArg(String namespaceFilter) {
        if (namespaceFilter == null || namespaceFilter.isBlank()) {
            return "-A";
        }
        return "-n=" + namespaceFilter;
    }
}
