package com.sportx.service;

import com.sportx.dto.ReviewRequest;
import com.sportx.entity.Product;
import com.sportx.entity.Review;
import com.sportx.entity.User;
import com.sportx.repository.ProductRepository;
import com.sportx.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final UserService userService;

    public ReviewService(ReviewRepository reviewRepository, ProductRepository productRepository,
                         ProductService productService, UserService userService) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.productService = productService;
        this.userService = userService;
    }

    public List<Review> forProduct(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    /** One review per customer per product: posting again edits the earlier one. */
    @Transactional
    public Review save(String email, ReviewRequest request) {
        User user = userService.findByEmail(email);
        Product product = productService.findById(request.getProductId());

        Review review = reviewRepository
                .findByUserIdAndProductId(user.getId(), product.getId())
                .orElseGet(Review::new);

        review.setUser(user);
        review.setProduct(product);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        Review saved = reviewRepository.save(review);

        recalculateRating(product);
        return saved;
    }

    private void recalculateRating(Product product) {
        Double average = reviewRepository.averageRating(product.getId());
        long count = reviewRepository.countByProductId(product.getId());
        product.setRating(Math.round((average == null ? 0 : average) * 10.0) / 10.0);
        product.setRatingCount((int) count);
        productRepository.save(product);
    }
}
