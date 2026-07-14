package com.portfolio.ecommerce.category;

import com.portfolio.ecommerce.category.dto.CategoryResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Tag(
    name = "Categories",
    description = "Product category operations"
)
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(
        summary = "List categories",
        description = "Returns every category available in the catalog."
    )
    @ApiResponse(
        responseCode = "200",
        description = "Categories returned successfully"
    )
    public List<CategoryResponse> findAll() {
        return categoryService.findAll();
    }
}