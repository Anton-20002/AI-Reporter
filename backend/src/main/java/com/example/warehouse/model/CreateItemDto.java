package com.example.warehouse.model;

public record CreateItemDto(
        String sku,
        String name,
        String category,
        int quantity,
        int minThreshold,
        String location
) {
}
