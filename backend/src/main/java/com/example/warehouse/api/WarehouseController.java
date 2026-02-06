package com.example.warehouse.api;

import com.example.warehouse.model.CreateItemDto;
import com.example.warehouse.model.MovementDto;
import com.example.warehouse.model.WarehouseItemDto;
import com.example.warehouse.proto.CreateItemRequest;
import com.example.warehouse.proto.GetItemsRequest;
import com.example.warehouse.proto.RegisterMovementRequest;
import com.example.warehouse.proto.WarehouseServiceGrpc;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class WarehouseController {

    private final WarehouseServiceGrpc.WarehouseServiceBlockingStub warehouseStub;

    public WarehouseController(WarehouseServiceGrpc.WarehouseServiceBlockingStub warehouseStub) {
        this.warehouseStub = warehouseStub;
    }

    @GetMapping("/items")
    public List<WarehouseItemDto> getItems() {
        return warehouseStub.getItems(GetItemsRequest.newBuilder().build())
                .getItemsList()
                .stream()
                .map(item -> new WarehouseItemDto(
                        item.getId(),
                        item.getSku(),
                        item.getName(),
                        item.getCategory(),
                        item.getQuantity(),
                        item.getMinThreshold(),
                        item.getLocation(),
                        item.getUpdatedAt()
                ))
                .toList();
    }

    @PostMapping("/items")
    public WarehouseItemDto createItem(@RequestBody CreateItemDto payload) {
        var item = warehouseStub.createItem(CreateItemRequest.newBuilder()
                .setSku(payload.sku())
                .setName(payload.name())
                .setCategory(payload.category())
                .setQuantity(payload.quantity())
                .setMinThreshold(payload.minThreshold())
                .setLocation(payload.location())
                .build());

        return new WarehouseItemDto(item.getId(), item.getSku(), item.getName(), item.getCategory(), item.getQuantity(), item.getMinThreshold(), item.getLocation(), item.getUpdatedAt());
    }

    @PostMapping("/movements")
    public WarehouseItemDto registerMovement(@RequestBody MovementDto payload) {
        var item = warehouseStub.registerMovement(RegisterMovementRequest.newBuilder()
                .setItemId(payload.itemId())
                .setDelta(payload.delta())
                .setReason(payload.reason())
                .build());

        return new WarehouseItemDto(item.getId(), item.getSku(), item.getName(), item.getCategory(), item.getQuantity(), item.getMinThreshold(), item.getLocation(), item.getUpdatedAt());
    }
}
