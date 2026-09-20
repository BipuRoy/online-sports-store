package com.sportx.config;

import com.sportx.entity.*;
import com.sportx.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

/**
 * Populates the database the first time the application starts so the project
 * can be demonstrated without any manual data entry.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${sportx.seed.enabled:true}")
    private boolean seedEnabled;

    public DataSeeder(UserRepository userRepository, CategoryRepository categoryRepository,
                      ProductRepository productRepository, CouponRepository couponRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!seedEnabled) return;

        seedUsers();
        Map<String, Category> categories = seedCategories();
        seedProducts(categories);
        seedCoupons();
    }

    private void seedUsers() {
        if (!userRepository.existsByEmail("admin@sportx.com")) {
            User admin = new User();
            admin.setName("SPORTX Admin");
            admin.setEmail("admin@sportx.com");
            admin.setPhone("9876543210");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
        }
        if (!userRepository.existsByEmail("customer@sportx.com")) {
            User customer = new User();
            customer.setName("Demo Customer");
            customer.setEmail("customer@sportx.com");
            customer.setPhone("9123456780");
            customer.setPassword(passwordEncoder.encode("customer123"));
            customer.setRole(Role.CUSTOMER);
            customer.setAddress("12 MG Road, Bharuch, Gujarat, India, 392001");
            userRepository.save(customer);
        }
    }

    private Map<String, Category> seedCategories() {
        String[][] data = {
            {"Cricket",    "Bats, balls, pads and protective gear for every format of the game.", "/assets/categories/cricket.svg"},
            {"Football",   "Match balls, boots, jerseys and keeper gloves for the pitch.",        "/assets/categories/football.svg"},
            {"Badminton",  "Rackets, shuttles, court shoes and nets for indoor play.",           "/assets/categories/badminton.svg"},
            {"Basketball", "Indoor and outdoor balls, court shoes and team jerseys.",            "/assets/categories/basketball.svg"},
            {"Fitness",    "Home gym essentials from dumbbells to mats and bands.",              "/assets/categories/fitness.svg"},
            {"Running",    "Shoes, apparel and watches built for distance.",                     "/assets/categories/running.svg"},
            {"Tennis",     "Rackets, balls and accessories for hard and clay courts.",           "/assets/categories/tennis.svg"}
        };

        Map<String, Category> map = new LinkedHashMap<>();
        for (String[] row : data) {
            Category category = categoryRepository.findByNameIgnoreCase(row[0])
                    .orElseGet(() -> categoryRepository.save(new Category(row[0], row[1], row[2])));
            map.put(row[0], category);
        }
        return map;
    }

    private void seedProducts(Map<String, Category> categories) {
        if (productRepository.count() > 0) return;

        // name | category | brand | price | discount | stock | rating | ratingCount | image | sizes | color | featured | best
        Object[][] data = {
            {"English Willow Cricket Bat", "Cricket", "SS", "4499", 20, 25, 4.6, 48, "cricket-bat", "SH,LB,Harrow", "Natural", true, true,
             "Grade 3 English willow blade with a mid-blade sweet spot, semi-oval handle and a pre-knocked face ready for match use.",
             "Blade: English Willow|Weight: 1180-1220 g|Handle: Cane, semi-oval|Grains: 6-8 straight|Finish: Pre-knocked"},
            {"Leather Cricket Ball (4 Pc)", "Cricket", "SG", "899", 10, 60, 4.3, 31, "cricket-ball", "", "Red",  false, true,
             "Four-piece alum-tanned leather ball with a hand-stitched seam that holds shape through a full 50-over innings.",
             "Weight: 156 g|Cover: Alum-tanned leather|Seam: Hand stitched|Suited to: Turf wickets"},
            {"Pro Batting Gloves", "Cricket", "SS", "1299", 15, 40, 4.2, 22, "batting-gloves", "S,M,L", "White/Blue", false, false,
             "Split-finger gloves with high-density foam across the thumb and a cotton towelling back that stays dry through long innings.",
             "Palm: Sheep leather|Protection: HD foam|Fit: Split finger|Wash: Hand wash only"},
            {"Steel Grille Cricket Helmet", "Cricket", "Shrey", "2799", 18, 22, 4.7, 37, "cricket-helmet", "M,L", "Navy", true, false,
             "ABS shell with an adjustable stainless steel grille that meets the current neck-protection guidance for junior and senior play.",
             "Shell: High-impact ABS|Grille: Stainless steel|Padding: Moisture-wicking|Adjustable: Yes"},
            {"Batting Leg Pads", "Cricket", "SG", "1999", 12, 30, 4.1, 18, "cricket-pads", "Youth,Men", "White", false, false,
             "Lightweight cane-reinforced pads with bolster padding at the knee roll and quick-release straps.",
             "Reinforcement: Cane rods|Weight: 1.6 kg pair|Straps: Quick release|Cover: PVC"},

            {"Match Football Size 5", "Football", "Nivia", "1199", 20, 55, 4.5, 64, "football", "5", "White/Black", true, true,
             "Thermo-bonded 32-panel ball with a butyl bladder that keeps pressure through a full season of training.",
             "Size: 5|Panels: 32, thermo-bonded|Bladder: Butyl|Circumference: 68-70 cm"},
            {"Firm Ground Football Boots", "Football", "Nivia", "2499", 25, 35, 4.4, 41, "football-shoes", "6,7,8,9,10,11", "Orange", true, false,
             "Moulded firm-ground studs under a textured synthetic upper that improves first touch in wet conditions.",
             "Surface: Firm ground|Upper: Textured synthetic|Studs: Moulded TPU|Closure: Lace-up"},
            {"Goalkeeper Gloves", "Football", "Vector X", "1099", 15, 28, 4.0, 15, "goalkeeper-gloves", "8,9,10", "Purple", false, false,
             "4 mm latex palm with finger spines and a wrap-around wrist strap for a locked-in fit.",
             "Palm: 4 mm latex|Protection: Finger spines|Cut: Roll finger|Closure: Wrist strap"},
            {"Team Football Jersey", "Football", "SPORTX", "799", 30, 70, 4.2, 26, "football-jersey", "S,M,L,XL,XXL", "Green", false, true,
             "Breathable polyester mesh jersey with a relaxed athletic cut and colour that holds through repeated washes.",
             "Fabric: 100% polyester|Fit: Regular|Feature: Moisture wicking|Care: Machine wash cold"},

            {"Carbon Badminton Racket", "Badminton", "Yonex", "2199", 22, 45, 4.6, 58, "badminton-racket", "G4,G5", "Teal", true, true,
             "Full carbon-graphite frame at 85 g, strung at 24 lbs, balanced slightly head-light for quick defensive play.",
             "Frame: Carbon graphite|Weight: 85 g (4U)|Tension: up to 30 lbs|Balance: Head light"},
            {"Feather Shuttlecock (Tube of 6)", "Badminton", "Yonex", "699", 10, 90, 4.3, 33, "shuttlecock", "", "White", false, false,
             "Grade A duck-feather shuttles with a cork base, sorted for consistent speed across the tube.",
             "Feather: Grade A duck|Base: Natural cork|Speed: 77 (medium)|Quantity: 6"},
            {"Court Badminton Shoes", "Badminton", "Yonex", "2999", 20, 26, 4.5, 29, "badminton-shoes", "6,7,8,9,10", "Cyan", false, false,
             "Non-marking gum rubber sole with a reinforced toe cap for lunges and a cushioned midsole for long rallies.",
             "Sole: Non-marking gum rubber|Midsole: EVA cushion|Toe: Reinforced cap|Weight: 310 g"},
            {"Nylon Badminton Net", "Badminton", "Vector X", "899", 10, 18, 3.9, 11, "badminton-net", "", "Black", false, false,
             "Full-width nylon net with a doubled tape header and side ropes, sized for standard doubles courts.",
             "Length: 6.1 m|Depth: 0.76 m|Material: Nylon|Header: Doubled tape"},

            {"Indoor/Outdoor Basketball", "Basketball", "Spalding", "1599", 18, 42, 4.5, 47, "basketball", "7", "Orange", true, true,
             "Composite leather cover with deep channels that grip well on both wooden courts and outdoor concrete.",
             "Size: 7|Cover: Composite leather|Bladder: Butyl|Use: Indoor and outdoor"},
            {"High-Top Basketball Shoes", "Basketball", "Nivia", "3199", 25, 24, 4.4, 30, "basketball-shoes", "7,8,9,10,11", "Purple", false, false,
             "High-top collar with a herringbone outsole and a cushioned heel unit that absorbs repeated landings.",
             "Collar: High top|Outsole: Herringbone rubber|Cushion: EVA heel unit|Surface: Court"},
            {"Reversible Basketball Jersey", "Basketball", "SPORTX", "999", 20, 50, 4.1, 17, "basketball-jersey", "S,M,L,XL", "Pink/Navy", false, false,
             "Reversible mesh jersey with taped side seams so one kit covers both halves of a scrimmage.",
             "Fabric: Poly mesh|Feature: Reversible|Fit: Athletic|Care: Machine wash"},

            {"Adjustable Dumbbell Set 20 kg", "Fitness", "Kore", "2899", 22, 33, 4.6, 72, "dumbbells", "20kg", "Black", true, true,
             "Pair of spinlock handles with PVC plates that adjust from 2.5 kg to 10 kg each side for a full home routine.",
             "Total weight: 20 kg|Plates: PVC coated|Handles: Spinlock|Includes: 2 handles, 4 collars"},
            {"Resistance Band Set (5 Levels)", "Fitness", "Boldfit", "699", 30, 80, 4.3, 55, "resistance-bands", "", "Multi", false, true,
             "Five latex loops from light to extra heavy, useful for warm-ups, mobility work and assisted pull-ups.",
             "Levels: 5|Material: Natural latex|Length: 60 cm loop|Includes: Carry pouch"},
            {"Anti-Slip Yoga Mat 6 mm", "Fitness", "Boldfit", "899", 20, 65, 4.4, 61, "yoga-mat", "6mm", "Teal", false, false,
             "6 mm TPE mat with a textured underside that stays put on tile and a closed-cell top that wipes clean.",
             "Thickness: 6 mm|Material: TPE|Size: 183 x 61 cm|Feature: Anti-slip, carry strap"},
            {"Speed Skipping Rope", "Fitness", "Kore", "399", 15, 100, 4.2, 38, "skipping-rope", "", "Amber", false, false,
             "Ball-bearing handles and an adjustable steel cable that holds a steady arc at high turnover.",
             "Cable: Coated steel|Length: Adjustable to 3 m|Handles: Ball bearing|Use: Speed and double-unders"},

            {"Cushioned Running Shoes", "Running", "Asics", "3499", 25, 38, 4.7, 89, "running-shoes", "6,7,8,9,10,11", "Red", true, true,
             "Neutral daily trainer with a compressed-EVA midsole and an engineered mesh upper that vents well in heat.",
             "Drop: 10 mm|Midsole: Compressed EVA|Upper: Engineered mesh|Weight: 255 g"},
            {"Dry-Fit Sports T-Shirt", "Running", "SPORTX", "599", 30, 120, 4.2, 44, "sports-tshirt", "S,M,L,XL,XXL", "Blue", false, false,
             "Lightweight knit that pulls sweat to the surface, with flatlock seams that avoid chafing on long runs.",
             "Fabric: Poly dry-fit|Seams: Flatlock|Fit: Regular|Care: Machine wash cold"},
            {"Training Sports Shorts", "Running", "SPORTX", "499", 25, 95, 4.0, 21, "sports-shorts", "S,M,L,XL", "Grey", false, false,
             "Four-way stretch shorts with a zip pocket and an inner drawcord that stays tied through a session.",
             "Fabric: 4-way stretch|Inseam: 7 inch|Pockets: 1 zip, 2 side|Waist: Elastic with drawcord"},
            {"GPS Running Watch", "Running", "Amazfit", "6999", 20, 15, 4.5, 52, "running-watch", "", "Teal", true, false,
             "Built-in GPS with wrist heart-rate, 14-day battery in smart mode and pace alerts you can set per kilometre.",
             "GPS: Built-in|Battery: 14 days|Sensors: HR, SpO2|Water rating: 5 ATM"},

            {"Graphite Tennis Racket", "Tennis", "Head", "3299", 20, 20, 4.4, 27, "tennis-racket", "G2,G3,G4", "Lime", false, false,
             "Graphite composite frame, 280 g strung, with a 100 sq in head that forgives off-centre contact.",
             "Head size: 100 sq in|Weight: 280 g strung|Balance: Even|String pattern: 16x19"},
            {"Tennis Balls (Can of 3)", "Tennis", "Head", "499", 10, 75, 4.1, 19, "tennis-balls", "", "Yellow", false, false,
             "Pressurised felt balls in a sealed can, consistent on hard courts for several sets of club play.",
             "Quantity: 3|Type: Pressurised|Felt: Woven wool blend|Surface: Hard court"}
        };

        List<Product> products = new ArrayList<>();
        for (Object[] row : data) {
            Product p = new Product();
            p.setName((String) row[0]);
            p.setCategory(categories.get((String) row[1]));
            p.setBrand((String) row[2]);
            p.setPrice(new BigDecimal((String) row[3]));
            p.setDiscount((Integer) row[4]);
            p.setStock((Integer) row[5]);
            p.setRating((Double) row[6]);
            p.setRatingCount((Integer) row[7]);
            String slug = (String) row[8];
            p.setImage("/assets/products/" + slug + ".svg");
            p.setImage2("/assets/products/" + slug + ".svg");
            p.setImage3("/assets/categories/" + ((String) row[1]).toLowerCase() + ".svg");
            p.setSizes((String) row[9]);
            p.setColor((String) row[10]);
            p.setFeatured((Boolean) row[11]);
            p.setBestSeller((Boolean) row[12]);
            p.setDescription((String) row[13]);
            p.setSpecifications((String) row[14]);
            products.add(p);
        }
        productRepository.saveAll(products);
    }

    private void seedCoupons() {
        if (couponRepository.count() > 0) return;
        couponRepository.saveAll(List.of(
            new Coupon("SPORTX10", 10, new BigDecimal("999"),  LocalDate.now().plusMonths(12)),
            new Coupon("PLAY20",   20, new BigDecimal("2999"), LocalDate.now().plusMonths(6)),
            new Coupon("NEW5",      5, new BigDecimal("499"),  LocalDate.now().plusMonths(12))
        ));
    }
}
