package com.sportx.service;

import com.sportx.dto.CategoryRequest;
import com.sportx.entity.Category;
import com.sportx.exception.BadRequestException;
import com.sportx.exception.ResourceNotFoundException;
import com.sportx.repository.CategoryRepository;
import com.sportx.repository.ProductRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    public List<Category> findAll() {
        return categoryRepository.findAll(Sort.by("name"));
    }

    public Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category " + id + " was not found"));
    }

    public Category create(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new BadRequestException("A category with this name already exists");
        }
        Category category = new Category();
        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        category.setImage(request.getImage());
        return categoryRepository.save(category);
    }

    public Category update(Long id, CategoryRequest request) {
        Category category = findById(id);
        categoryRepository.findByNameIgnoreCase(request.getName().trim())
                .filter(other -> !other.getId().equals(id))
                .ifPresent(other -> { throw new BadRequestException("A category with this name already exists"); });

        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        if (request.getImage() != null) category.setImage(request.getImage());
        return categoryRepository.save(category);
    }

    public void delete(Long id) {
        Category category = findById(id);
        long productCount = productRepository.findAll().stream()
                .filter(p -> p.getCategory() != null && p.getCategory().getId().equals(id))
                .count();
        if (productCount > 0) {
            throw new BadRequestException(
                    "This category still has " + productCount + " product(s). Move or delete them first.");
        }
        categoryRepository.delete(category);
    }
}
