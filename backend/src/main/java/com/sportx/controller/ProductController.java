package com.sportx.controller;

import com.sportx.dto.ApiMessage;
import com.sportx.dto.ProductRequest;
import com.sportx.entity.Product;
import com.sportx.entity.Review;
import com.sportx.service.ProductService;
import com.sportx.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final ReviewService reviewService;

    public ProductController(ProductService productService, ReviewService reviewService) {
        this.productService = productService;
        this.reviewService = reviewService;
    }

    /** GET /api/products?search=&categoryId=&minPrice=&maxPrice=&minRating=&sort=&page=&size= */
    @GetMapping
    public ResponseEntity<Page<Product>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        return ResponseEntity.ok(
                productService.search(search, categoryId, minPrice, maxPrice, minRating, sort, page, size));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Product>> featured() {
        return ResponseEntity.ok(productService.featured());
    }

    @GetMapping("/best-sellers")
    public ResponseEntity<List<Product>> bestSellers() {
        return ResponseEntity.ok(productService.bestSellers());
    }

    @GetMapping("/new-arrivals")
    public ResponseEntity<List<Product>> newArrivals() {
        return ResponseEntity.ok(productService.newArrivals());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> byId(@PathVariable Long id) {
        return ResponseEntity.ok(productService.findById(id));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<List<Product>> related(@PathVariable Long id) {
        return ResponseEntity.ok(productService.related(id));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<Review>> reviews(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.forProduct(id));
    }

    // ---------------- admin only (enforced in SecurityConfig) ----------------

    @PostMapping
    public ResponseEntity<Product> create(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.update(id, request));
    }

    @PutMapping("/{id}/stock")
    public ResponseEntity<Product> updateStock(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(productService.updateStock(id, body.getOrDefault("stock", 0)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiMessage> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiMessage.ok("Product deleted"));
    }
}
