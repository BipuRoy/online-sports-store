package com.sportx.controller;

import com.sportx.dto.ApiMessage;
import com.sportx.dto.DashboardStats;
import com.sportx.entity.Coupon;
import com.sportx.entity.User;
import com.sportx.service.AdminService;
import com.sportx.service.CouponService;
import com.sportx.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;
    private final CouponService couponService;

    public AdminController(AdminService adminService, UserService userService, CouponService couponService) {
        this.adminService = adminService;
        this.userService = userService;
        this.couponService = couponService;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> stats() {
        return ResponseEntity.ok(adminService.stats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> users() {
        return ResponseEntity.ok(userService.findAll());
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<User> setActive(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(userService.setActive(id, Boolean.TRUE.equals(body.get("active"))));
    }

    @GetMapping("/coupons")
    public ResponseEntity<List<Coupon>> coupons() {
        return ResponseEntity.ok(couponService.findAll());
    }

    @PostMapping("/coupons")
    public ResponseEntity<Coupon> createCoupon(@RequestBody Coupon coupon) {
        return ResponseEntity.ok(couponService.save(coupon));
    }

    @DeleteMapping("/coupons/{id}")
    public ResponseEntity<ApiMessage> deleteCoupon(@PathVariable Long id) {
        couponService.delete(id);
        return ResponseEntity.ok(ApiMessage.ok("Coupon deleted"));
    }
}
