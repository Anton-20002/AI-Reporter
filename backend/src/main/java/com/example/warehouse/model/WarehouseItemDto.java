package com.example.warehouse.model;

public record WarehouseItemDto(
        String id,
        String sku,
        String name,
        String category,
        int quantity,
        int minThreshold,
        String location,
        String updatedAt
) {
}
