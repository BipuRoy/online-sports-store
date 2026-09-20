package com.sportx.controller;

import com.sportx.dto.ApiMessage;
import com.sportx.entity.Coupon;
import com.sportx.service.CouponService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final CouponService couponService;

    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    /** Checks a code against the current subtotal before the customer reaches checkout. */
    @PostMapping("/validate")
    public ResponseEntity<ApiMessage> validate(@RequestBody Map<String, String> body) {
        BigDecimal subTotal = new BigDecimal(body.getOrDefault("subTotal", "0"));
        Coupon coupon = couponService.validate(body.get("code"), subTotal);
        return ResponseEntity.ok(ApiMessage.ok(
                coupon.getDiscount() + "% off applied with " + coupon.getCode(), coupon));
    }
}
