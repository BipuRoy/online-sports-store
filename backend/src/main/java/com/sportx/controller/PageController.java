package com.sportx.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Maps clean URLs to the static HTML pages so links look tidy in the browser.
 */
@Controller
public class PageController {

    @GetMapping("/shop")            public String shop()        { return "forward:/pages/shop.html"; }
    @GetMapping("/product")         public String product()     { return "forward:/pages/product.html"; }
    @GetMapping("/cart")            public String cart()        { return "forward:/pages/cart.html"; }
    @GetMapping("/checkout")        public String checkout()    { return "forward:/pages/checkout.html"; }
    @GetMapping("/login")           public String login()       { return "forward:/pages/login.html"; }
    @GetMapping("/register")        public String register()    { return "forward:/pages/register.html"; }
    @GetMapping("/dashboard")       public String dashboard()   { return "forward:/pages/dashboard.html"; }
    @GetMapping("/wishlist")        public String wishlist()    { return "forward:/pages/wishlist.html"; }
    @GetMapping("/admin")           public String admin()       { return "forward:/pages/admin.html"; }
    @GetMapping("/about")           public String about()       { return "forward:/pages/about.html"; }
    @GetMapping("/contact")         public String contact()     { return "forward:/pages/contact.html"; }
    @GetMapping("/faq")             public String faq()         { return "forward:/pages/faq.html"; }
    @GetMapping("/order-success")   public String orderSuccess(){ return "forward:/pages/order-success.html"; }
}
