package com.example.warehouse.model;

public record MovementDto(
        String itemId,
        int delta,
        String reason
) {
}
