package com.sportx.service;

import com.sportx.entity.Product;
import com.sportx.entity.User;
import com.sportx.entity.WishlistItem;
import com.sportx.exception.BadRequestException;
import com.sportx.exception.ResourceNotFoundException;
import com.sportx.repository.WishlistItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WishlistService {

    private final WishlistItemRepository wishlistRepository;
    private final ProductService productService;
    private final UserService userService;

    public WishlistService(WishlistItemRepository wishlistRepository,
                           ProductService productService, UserService userService) {
        this.wishlistRepository = wishlistRepository;
        this.productService = productService;
        this.userService = userService;
    }

    public List<WishlistItem> items(String email) {
        return wishlistRepository.findByUserId(userService.findByEmail(email).getId());
    }

    @Transactional
    public WishlistItem add(String email, Long productId) {
        User user = userService.findByEmail(email);
        Product product = productService.findById(productId);

        if (wishlistRepository.existsByUserIdAndProductId(user.getId(), productId)) {
            throw new BadRequestException(product.getName() + " is already in your wishlist");
        }
        WishlistItem item = new WishlistItem();
        item.setUser(user);
        item.setProduct(product);
        return wishlistRepository.save(item);
    }

    @Transactional
    public void remove(String email, Long productId) {
        User user = userService.findByEmail(email);
        WishlistItem item = wishlistRepository.findByUserIdAndProductId(user.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("That product is not in your wishlist"));
        wishlistRepository.delete(item);
    }
}
