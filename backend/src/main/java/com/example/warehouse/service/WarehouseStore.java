package com.example.warehouse.service;

import com.example.warehouse.model.CreateItemDto;
import com.example.warehouse.model.MovementDto;
import com.example.warehouse.model.WarehouseItemDto;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WarehouseStore {

    private final Map<String, WarehouseItemDto> items = new ConcurrentHashMap<>();

    public WarehouseStore() {
        createItem(new CreateItemDto("EL-1001", "Сканер штрихкодов", "Электроника", 14, 5, "A-01"));
        createItem(new CreateItemDto("PK-2002", "Картонная коробка M", "Упаковка", 120, 40, "B-14"));
        createItem(new CreateItemDto("SP-3003", "Подшипник 608ZZ", "Запчасти", 3, 10, "C-07"));
    }

    public List<WarehouseItemDto> getItems() {
        return new ArrayList<>(items.values());
    }

    public WarehouseItemDto createItem(CreateItemDto request) {
        WarehouseItemDto item = new WarehouseItemDto(
                UUID.randomUUID().toString(),
                request.sku(),
                request.name(),
                request.category(),
                Math.max(0, request.quantity()),
                Math.max(0, request.minThreshold()),
                request.location(),
                Instant.now().toString()
        );
        items.put(item.id(), item);
        return item;
    }

    public WarehouseItemDto registerMovement(MovementDto movement) {
        WarehouseItemDto source = items.get(movement.itemId());
        if (source == null) {
            throw new IllegalArgumentException("Item not found: " + movement.itemId());
        }

        WarehouseItemDto updated = new WarehouseItemDto(
                source.id(),
                source.sku(),
                source.name(),
                source.category(),
                Math.max(0, source.quantity() + movement.delta()),
                source.minThreshold(),
                source.location(),
                Instant.now().toString()
        );
        items.put(source.id(), updated);
        return updated;
    }
}
