package com.sportx.dto;

import com.sportx.entity.CartItem;

import java.math.BigDecimal;
import java.util.List;

public class CartSummary {

    private List<CartItem> items;
    private int totalQuantity;
    private BigDecimal subTotal;
    private BigDecimal productDiscount;
    private BigDecimal couponDiscount;
    private BigDecimal deliveryCharge;
    private BigDecimal total;
    private String couponCode;

    public List<CartItem> getItems() { return items; }
    public void setItems(List<CartItem> items) { this.items = items; }
    public int getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(int totalQuantity) { this.totalQuantity = totalQuantity; }
    public BigDecimal getSubTotal() { return subTotal; }
    public void setSubTotal(BigDecimal subTotal) { this.subTotal = subTotal; }
    public BigDecimal getProductDiscount() { return productDiscount; }
    public void setProductDiscount(BigDecimal productDiscount) { this.productDiscount = productDiscount; }
    public BigDecimal getCouponDiscount() { return couponDiscount; }
    public void setCouponDiscount(BigDecimal couponDiscount) { this.couponDiscount = couponDiscount; }
    public BigDecimal getDeliveryCharge() { return deliveryCharge; }
    public void setDeliveryCharge(BigDecimal deliveryCharge) { this.deliveryCharge = deliveryCharge; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }
}
