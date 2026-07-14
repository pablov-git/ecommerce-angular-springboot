package com.portfolio.ecommerce.product;

import com.portfolio.ecommerce.common.exception.ApiError;
import com.portfolio.ecommerce.product.dto.ProductResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(
    name = "Products",
    description = "Product catalog operations"
)
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(
        summary = "List products",
        description = "Returns every product available in the catalog."
    )
    @ApiResponse(
        responseCode = "200",
        description = "Products returned successfully"
    )
    public List<ProductResponse> findAll() {
        return productService.findAll();
    }

    @GetMapping("/{id}")
    @Operation(
        summary = "Get a product",
        description = "Returns a product identified by its UUID."
    )
    @ApiResponses({
        @ApiResponse(
            responseCode = "200",
            description = "Product returned successfully",
            content = @Content(
                schema = @Schema(implementation = ProductResponse.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Product not found",
            content = @Content(
                schema = @Schema(implementation = ApiError.class)
            )
        )
    })
    public ProductResponse findById(
        @Parameter(
            description = "Product UUID",
            example = "550e8400-e29b-41d4-a716-446655440000"
        )
        @PathVariable UUID id
    ) {
        return productService.findById(id);
    }
}