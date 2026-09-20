package com.sportx.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "cart",
       uniqueConstraints = @UniqueConstraint(name = "uk_cart_user_product",
                                             columnNames = {"user_id", "product_id"}),
       indexes = @Index(name = "idx_cart_user", columnList = "user_id"))
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_cart_user"))
    private User user;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "product_id", foreignKey = @ForeignKey(name = "fk_cart_product"))
    private Product product;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(length = 20)
    private String size;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
}
