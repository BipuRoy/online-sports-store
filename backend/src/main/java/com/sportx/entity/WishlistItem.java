package com.sportx.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "wishlist",
       uniqueConstraints = @UniqueConstraint(name = "uk_wishlist_user_product",
                                             columnNames = {"user_id", "product_id"}),
       indexes = @Index(name = "idx_wishlist_user", columnList = "user_id"))
public class WishlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_wishlist_user"))
    private User user;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "product_id", foreignKey = @ForeignKey(name = "fk_wishlist_product"))
    private Product product;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
}
