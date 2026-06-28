package com.portfolio.ecommerce.category;

import com.portfolio.ecommerce.category.dto.CategoryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Transactional(readOnly = true)
    public List<CategoryResponse> findAll() {
        return categoryMapper.toResponseList(
            categoryRepository.findAll(Sort.by("name").ascending())
        );
    }
}