package com.sportx.controller;

import com.sportx.dto.ApiMessage;
import com.sportx.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.List;
import java.util.UUID;

/**
 * Stores an uploaded product image on disk and returns the public URL to save on the product.
 */
@RestController
@RequestMapping("/api/upload")
@PreAuthorize("hasRole('ADMIN')")
public class UploadController {

    private static final List<String> ALLOWED = List.of("jpg", "jpeg", "png", "webp", "gif");

    @Value("${sportx.upload.dir}")
    private String uploadDir;

    @PostMapping
    public ResponseEntity<ApiMessage> upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Choose an image file to upload");
        }

        String original = Path.of(file.getOriginalFilename() == null ? "image" : file.getOriginalFilename())
                              .getFileName().toString();
        String extension = original.contains(".")
                ? original.substring(original.lastIndexOf('.') + 1).toLowerCase() : "";

        if (!ALLOWED.contains(extension)) {
            throw new BadRequestException("Upload a JPG, PNG, WEBP or GIF image");
        }

        try {
            Path folder = Paths.get(uploadDir).toAbsolutePath();
            Files.createDirectories(folder);
            String filename = UUID.randomUUID() + "." + extension;
            Files.copy(file.getInputStream(), folder.resolve(filename),
                       StandardCopyOption.REPLACE_EXISTING);
            return ResponseEntity.ok(ApiMessage.ok("Image uploaded", "/uploads/" + filename));
        } catch (Exception ex) {
            throw new BadRequestException("Could not save the image: " + ex.getMessage());
        }
    }
}
