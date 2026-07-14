package com.portfolio.ecommerce.order;

import com.portfolio.ecommerce.common.exception.ApiError;
import com.portfolio.ecommerce.order.dto.CreateOrderRequest;
import com.portfolio.ecommerce.order.dto.OrderResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(
    name = "Orders",
    description = "Transactional customer order creation"
)
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
        summary = "Create an order",
        description = """
            Validates products and stock, calculates order totals,
            persists the order and its items, and decreases product stock.
            """
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "201",
            description = "Order created successfully",
            content = @Content(
                schema = @Schema(implementation = OrderResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid request or insufficient stock",
            content = @Content(
                schema = @Schema(implementation = ApiError.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "One of the requested products was not found",
            content = @Content(
                schema = @Schema(implementation = ApiError.class)
            )
        )
    })
    public OrderResponse create(
        @Valid @RequestBody CreateOrderRequest request
    ) {
        return orderService.create(request);
    }
}