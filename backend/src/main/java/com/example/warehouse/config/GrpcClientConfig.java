package com.example.warehouse.config;

import com.example.warehouse.proto.WarehouseServiceGrpc;
import io.grpc.ManagedChannel;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GrpcClientConfig {

    @Bean
    WarehouseServiceGrpc.WarehouseServiceBlockingStub warehouseServiceBlockingStub(
            @GrpcClient("warehouse-service") ManagedChannel channel
    ) {
        return WarehouseServiceGrpc.newBlockingStub(channel);
    }
}
