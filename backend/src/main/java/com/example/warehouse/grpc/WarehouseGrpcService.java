package com.example.warehouse.grpc;

import com.example.warehouse.model.CreateItemDto;
import com.example.warehouse.model.MovementDto;
import com.example.warehouse.model.WarehouseItemDto;
import com.example.warehouse.proto.CreateItemRequest;
import com.example.warehouse.proto.GetItemsRequest;
import com.example.warehouse.proto.GetItemsResponse;
import com.example.warehouse.proto.RegisterMovementRequest;
import com.example.warehouse.proto.WarehouseItem;
import com.example.warehouse.proto.WarehouseServiceGrpc;
import com.example.warehouse.service.WarehouseStore;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;

@GrpcService
public class WarehouseGrpcService extends WarehouseServiceGrpc.WarehouseServiceImplBase {

    private final WarehouseStore store;

    public WarehouseGrpcService(WarehouseStore store) {
        this.store = store;
    }

    @Override
    public void getItems(GetItemsRequest request, StreamObserver<GetItemsResponse> responseObserver) {
        GetItemsResponse response = GetItemsResponse.newBuilder()
                .addAllItems(store.getItems().stream().map(this::toProto).toList())
                .build();
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void createItem(CreateItemRequest request, StreamObserver<WarehouseItem> responseObserver) {
        WarehouseItemDto saved = store.createItem(new CreateItemDto(
                request.getSku(),
                request.getName(),
                request.getCategory(),
                request.getQuantity(),
                request.getMinThreshold(),
                request.getLocation()
        ));
        responseObserver.onNext(toProto(saved));
        responseObserver.onCompleted();
    }

    @Override
    public void registerMovement(RegisterMovementRequest request, StreamObserver<WarehouseItem> responseObserver) {
        WarehouseItemDto updated = store.registerMovement(new MovementDto(
                request.getItemId(),
                request.getDelta(),
                request.getReason()
        ));
        responseObserver.onNext(toProto(updated));
        responseObserver.onCompleted();
    }

    private WarehouseItem toProto(WarehouseItemDto item) {
        return WarehouseItem.newBuilder()
                .setId(item.id())
                .setSku(item.sku())
                .setName(item.name())
                .setCategory(item.category())
                .setQuantity(item.quantity())
                .setMinThreshold(item.minThreshold())
                .setLocation(item.location())
                .setUpdatedAt(item.updatedAt())
                .build();
    }
}
