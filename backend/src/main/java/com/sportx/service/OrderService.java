package com.sportx.service;

import com.sportx.dto.CartSummary;
import com.sportx.dto.OrderRequest;
import com.sportx.entity.*;
import com.sportx.exception.BadRequestException;
import com.sportx.exception.ResourceNotFoundException;
import com.sportx.repository.OrderRepository;
import com.sportx.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;
    private final UserService userService;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository,
                        CartService cartService, UserService userService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.cartService = cartService;
        this.userService = userService;
    }

    /**
     * Converts the signed-in customer's cart into an order, reduces stock,
     * and empties the cart. Runs in one transaction so a stock failure rolls everything back.
     */
    @Transactional
    public Order placeOrder(String email, OrderRequest request) {
        User user = userService.findByEmail(email);
        CartSummary summary = cartService.summary(email, request.getCouponCode());

        if (summary.getItems().isEmpty()) {
            throw new BadRequestException("Your cart is empty. Add a product before checking out.");
        }

        String method = request.getPaymentMethod().toUpperCase();
        if (!method.equals("COD") && !method.equals("ONLINE")) {
            throw new BadRequestException("Choose either Cash on Delivery or Online Payment");
        }

        Order order = new Order();
        order.setUser(user);
        order.setSubTotal(summary.getSubTotal());
        order.setDiscountAmount(summary.getCouponDiscount());
        order.setDeliveryCharge(summary.getDeliveryCharge());
        order.setTotalAmount(summary.getTotal());
        order.setCouponCode(summary.getCouponCode());
        order.setPaymentMethod(method);
        // Mock gateway: an online payment is treated as captured immediately.
        order.setPaymentStatus(method.equals("ONLINE") ? "PAID" : "PENDING");
        order.setOrderStatus(OrderStatus.PENDING);
        order.setCustomerName(request.getFullName());
        order.setCustomerEmail(request.getEmail());
        order.setCustomerPhone(request.getPhone());
        order.setShippingAddress(String.join(", ",
                request.getAddress(), request.getCity(), request.getState(),
                request.getCountry(), request.getPincode()));

        for (CartItem cartItem : summary.getItems()) {
            Product product = cartItem.getProduct();

            if (product.getStock() < cartItem.getQuantity()) {
                throw new BadRequestException(
                        "Only " + product.getStock() + " left in stock for " + product.getName());
            }
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setProductName(product.getName());
            item.setQuantity(cartItem.getQuantity());
            item.setPrice(product.getFinalPrice());
            item.setSize(cartItem.getSize());
            order.addItem(item);
        }

        Order saved = orderRepository.save(order);
        cartService.clear(email);
        return saved;
    }

    public List<Order> myOrders(String email) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userService.findByEmail(email).getId());
    }

    public List<Order> allOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }

    public Order findById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order #" + id + " was not found"));
    }

    /** A customer may only open their own order; an admin may open any. */
    public Order findForUser(Long id, String email, boolean admin) {
        Order order = findById(id);
        if (!admin && !order.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new BadRequestException("That order does not belong to you");
        }
        return order;
    }

    @Transactional
    public Order updateStatus(Long id, String status) {
        Order order = findById(id);
        OrderStatus next;
        try {
            next = OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Unknown order status: " + status);
        }

        if (order.getOrderStatus() == OrderStatus.DELIVERED && next != OrderStatus.DELIVERED) {
            throw new BadRequestException("A delivered order cannot change status");
        }
        if (next == OrderStatus.CANCELLED && order.getOrderStatus() != OrderStatus.CANCELLED) {
            restoreStock(order);
        }
        order.setOrderStatus(next);
        if (next == OrderStatus.DELIVERED && "COD".equals(order.getPaymentMethod())) {
            order.setPaymentStatus("PAID");
        }
        return orderRepository.save(order);
    }

    /** A customer can cancel only while the order has not shipped. */
    @Transactional
    public Order cancelOwnOrder(Long id, String email) {
        Order order = findForUser(id, email, false);
        if (order.getOrderStatus() == OrderStatus.SHIPPED
                || order.getOrderStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException("This order has already shipped and cannot be cancelled");
        }
        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("This order is already cancelled");
        }
        restoreStock(order);
        order.setOrderStatus(OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

    private void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            if (product != null) {
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }
        }
    }
}
