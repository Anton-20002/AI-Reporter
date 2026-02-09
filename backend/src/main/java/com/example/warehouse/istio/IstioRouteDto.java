package com.example.warehouse.istio;

public record IstioRouteDto(
        String namespace,
        String service,
        String host,
        int port,
        String protocol,
        String gateway,
        String path,
        String source,
        boolean internal
) {
}
