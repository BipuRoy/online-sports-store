package com.sportx.service;

import com.sportx.dto.CartItemRequest;
import com.sportx.dto.CartSummary;
import com.sportx.entity.*;
import com.sportx.exception.BadRequestException;
import com.sportx.exception.ResourceNotFoundException;
import com.sportx.repository.CartItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class CartService {

    /** Orders at or above this value ship free. */
    public static final BigDecimal FREE_DELIVERY_THRESHOLD = new BigDecimal("999");
    public static final BigDecimal DELIVERY_CHARGE = new BigDecimal("49");

    private final CartItemRepository cartItemRepository;
    private final ProductService productService;
    private final UserService userService;
    private final CouponService couponService;

    public CartService(CartItemRepository cartItemRepository, ProductService productService,
                       UserService userService, CouponService couponService) {
        this.cartItemRepository = cartItemRepository;
        this.productService = productService;
        this.userService = userService;
        this.couponService = couponService;
    }

    public List<CartItem> items(String email) {
        User user = userService.findByEmail(email);
        return cartItemRepository.findByUserId(user.getId());
    }

    @Transactional
    public CartItem add(String email, CartItemRequest request) {
        User user = userService.findByEmail(email);
        Product product = productService.findById(request.getProductId());

        int requested = request.getQuantity() == null ? 1 : request.getQuantity();
        if (requested < 1) throw new BadRequestException("Quantity must be at least 1");

        CartItem item = cartItemRepository
                .findByUserIdAndProductId(user.getId(), product.getId())
                .orElse(null);

        int newQuantity = (item == null) ? requested : item.getQuantity() + requested;
        assertStock(product, newQuantity);

        if (item == null) {
            item = new CartItem();
            item.setUser(user);
            item.setProduct(product);
        }
        item.setQuantity(newQuantity);
        if (request.getSize() != null) item.setSize(request.getSize());
        return cartItemRepository.save(item);
    }

    @Transactional
    public CartItem updateQuantity(String email, Long cartItemId, int quantity) {
        User user = userService.findByEmail(email);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("That cart item no longer exists"));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("That cart item does not belong to you");
        }
        if (quantity < 1) throw new BadRequestException("Quantity must be at least 1");

        assertStock(item.getProduct(), quantity);
        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    @Transactional
    public void remove(String email, Long cartItemId) {
        User user = userService.findByEmail(email);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("That cart item no longer exists"));
        if (!item.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("That cart item does not belong to you");
        }
        cartItemRepository.delete(item);
    }

    @Transactional
    public void clear(String email) {
        User user = userService.findByEmail(email);
        cartItemRepository.deleteByUserId(user.getId());
    }

    /** Builds totals for the cart page and the checkout summary. */
    public CartSummary summary(String email, String couponCode) {
        List<CartItem> items = items(email);

        BigDecimal listTotal = BigDecimal.ZERO;   // before per-product discount
        BigDecimal subTotal = BigDecimal.ZERO;    // after per-product discount
        int quantity = 0;

        for (CartItem item : items) {
            Product p = item.getProduct();
            BigDecimal qty = BigDecimal.valueOf(item.getQuantity());
            listTotal = listTotal.add(p.getPrice().multiply(qty));
            subTotal = subTotal.add(p.getFinalPrice().multiply(qty));
            quantity += item.getQuantity();
        }

        BigDecimal couponDiscount = BigDecimal.ZERO;
        String appliedCode = null;
        if (couponCode != null && !couponCode.isBlank() && subTotal.compareTo(BigDecimal.ZERO) > 0) {
            Coupon coupon = couponService.validate(couponCode, subTotal);
            couponDiscount = subTotal.multiply(BigDecimal.valueOf(coupon.getDiscount()))
                                     .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            appliedCode = coupon.getCode();
        }

        BigDecimal payable = subTotal.subtract(couponDiscount);
        BigDecimal delivery = (items.isEmpty() || payable.compareTo(FREE_DELIVERY_THRESHOLD) >= 0)
                ? BigDecimal.ZERO : DELIVERY_CHARGE;

        CartSummary summary = new CartSummary();
        summary.setItems(items);
        summary.setTotalQuantity(quantity);
        summary.setSubTotal(subTotal.setScale(2, RoundingMode.HALF_UP));
        summary.setProductDiscount(listTotal.subtract(subTotal).setScale(2, RoundingMode.HALF_UP));
        summary.setCouponDiscount(couponDiscount.setScale(2, RoundingMode.HALF_UP));
        summary.setDeliveryCharge(delivery.setScale(2, RoundingMode.HALF_UP));
        summary.setTotal(payable.add(delivery).setScale(2, RoundingMode.HALF_UP));
        summary.setCouponCode(appliedCode);
        return summary;
    }

    /** Refuses to let a customer reserve more units than exist. */
    private void assertStock(Product product, int wanted) {
        if (product.getStock() == null || product.getStock() <= 0) {
            throw new BadRequestException(product.getName() + " is out of stock");
        }
        if (wanted > product.getStock()) {
            throw new BadRequestException(
                    "Only " + product.getStock() + " left in stock for " + product.getName());
        }
    }
}
