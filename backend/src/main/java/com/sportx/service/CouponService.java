package com.sportx.service;

import com.sportx.entity.Coupon;
import com.sportx.exception.BadRequestException;
import com.sportx.exception.ResourceNotFoundException;
import com.sportx.repository.CouponRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public List<Coupon> findAll() {
        return couponRepository.findAll();
    }

    public Coupon save(Coupon coupon) {
        coupon.setCode(coupon.getCode().trim().toUpperCase());
        return couponRepository.save(coupon);
    }

    public void delete(Long id) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon " + id + " was not found"));
        couponRepository.delete(coupon);
    }

    /** Returns the coupon when it can be used for this subtotal, otherwise explains why not. */
    public Coupon validate(String code, BigDecimal subTotal) {
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new BadRequestException("That coupon code is not valid"));

        if (Boolean.FALSE.equals(coupon.getStatus())) {
            throw new BadRequestException("That coupon is no longer active");
        }
        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("That coupon expired on " + coupon.getExpiryDate());
        }
        if (subTotal.compareTo(coupon.getMinOrderAmount()) < 0) {
            throw new BadRequestException(
                    "Add items worth " + coupon.getMinOrderAmount() + " to use this coupon");
        }
        return coupon;
    }
}
