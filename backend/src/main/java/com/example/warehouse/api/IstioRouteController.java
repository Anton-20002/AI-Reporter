package com.example.warehouse.api;

import com.example.warehouse.istio.IstioRouteDiscoveryService;
import com.example.warehouse.istio.IstioRouteDto;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/istio")
@CrossOrigin(origins = "*")
public class IstioRouteController {

    private final IstioRouteDiscoveryService routeDiscoveryService;

    public IstioRouteController(IstioRouteDiscoveryService routeDiscoveryService) {
        this.routeDiscoveryService = routeDiscoveryService;
    }

    @GetMapping("/routes")
    public List<IstioRouteDto> discoverRoutes(@RequestParam(required = false) String namespace) {
        return routeDiscoveryService.discoverRoutes(namespace);
    }
}
