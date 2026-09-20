package com.sportx.service;

import com.sportx.dto.DashboardStats;
import com.sportx.entity.OrderStatus;
import com.sportx.entity.Role;
import com.sportx.repository.OrderRepository;
import com.sportx.repository.ProductRepository;
import com.sportx.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private static final int LOW_STOCK_THRESHOLD = 5;

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public AdminService(UserRepository userRepository, ProductRepository productRepository,
                        OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    public DashboardStats stats() {
        DashboardStats stats = new DashboardStats();
        stats.setTotalUsers(userRepository.countByRole(Role.CUSTOMER));
        stats.setTotalProducts(productRepository.count());
        stats.setTotalOrders(orderRepository.count());
        stats.setTotalRevenue(orderRepository.totalRevenue());
        stats.setPendingOrders(orderRepository.countByOrderStatus(OrderStatus.PENDING));
        stats.setDeliveredOrders(orderRepository.countByOrderStatus(OrderStatus.DELIVERED));
        stats.setCancelledOrders(orderRepository.countByOrderStatus(OrderStatus.CANCELLED));
        stats.setLowStockProducts(productRepository.countByStockLessThan(LOW_STOCK_THRESHOLD));
        return stats;
    }
}
