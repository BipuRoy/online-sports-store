package com.sportx.service;

import com.sportx.dto.ProductRequest;
import com.sportx.entity.Category;
import com.sportx.entity.Product;
import com.sportx.exception.ResourceNotFoundException;
import com.sportx.repository.ProductRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryService categoryService;

    public ProductService(ProductRepository productRepository, CategoryService categoryService) {
        this.productRepository = productRepository;
        this.categoryService = categoryService;
    }

    /**
     * Search + filter + sort + paginate, all driven by optional query parameters.
     * sort accepts: priceAsc, priceDesc, rating, newest, name
     */
    public Page<Product> search(String search, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice,
                                Double minRating, String sort, int page, int size) {

        Sort sorting = switch (sort == null ? "" : sort) {
            case "priceAsc"  -> Sort.by(Sort.Direction.ASC, "price");
            case "priceDesc" -> Sort.by(Sort.Direction.DESC, "price");
            case "rating"    -> Sort.by(Sort.Direction.DESC, "rating");
            case "name"      -> Sort.by(Sort.Direction.ASC, "name");
            default          -> Sort.by(Sort.Direction.DESC, "createdAt");
        };

        String term = (search == null || search.isBlank()) ? null : search.trim();
        Pageable pageable = PageRequest.of(Math.max(page, 0), size <= 0 ? 12 : size, sorting);
        return productRepository.search(term, categoryId, minPrice, maxPrice, minRating, pageable);
    }

    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product " + id + " was not found"));
    }

    public List<Product> featured()    { return productRepository.findByFeaturedTrue(); }
    public List<Product> bestSellers() { return productRepository.findByBestSellerTrue(); }
    public List<Product> newArrivals() { return productRepository.findTop8ByOrderByCreatedAtDesc(); }

    public List<Product> related(Long productId) {
        Product product = findById(productId);
        return productRepository.findTop4ByCategoryIdAndIdNot(product.getCategory().getId(), productId);
    }

    public Product create(ProductRequest request) {
        Product product = new Product();
        apply(product, request);
        return productRepository.save(product);
    }

    public Product update(Long id, ProductRequest request) {
        Product product = findById(id);
        apply(product, request);
        return productRepository.save(product);
    }

    public void delete(Long id) {
        productRepository.delete(findById(id));
    }

    public Product updateStock(Long id, int stock) {
        Product product = findById(id);
        product.setStock(Math.max(stock, 0));
        return productRepository.save(product);
    }

    private void apply(Product product, ProductRequest request) {
        Category category = categoryService.findById(request.getCategoryId());
        product.setName(request.getName().trim());
        product.setCategory(category);
        product.setBrand(request.getBrand());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setDiscount(request.getDiscount() == null ? 0 : request.getDiscount());
        product.setStock(request.getStock() == null ? 0 : request.getStock());
        product.setImage(request.getImage());
        product.setImage2(request.getImage2());
        product.setImage3(request.getImage3());
        product.setSizes(request.getSizes());
        product.setColor(request.getColor());
        product.setSpecifications(request.getSpecifications());
        product.setFeatured(Boolean.TRUE.equals(request.getFeatured()));
        product.setBestSeller(Boolean.TRUE.equals(request.getBestSeller()));
    }
}
