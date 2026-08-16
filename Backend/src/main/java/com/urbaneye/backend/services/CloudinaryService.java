package com.urbaneye.backend.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return "";
        }
        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", "urbaneye_issues"
        ));
        return (String) uploadResult.get("secure_url");
    }

    public String uploadBase64Image(String base64String) {
        if (!StringUtils.hasText(base64String)) {
            return "";
        }
        // Basic check if it is a base64 Data URI
        if (!base64String.startsWith("data:image/")) {
            // If it is already a URL, return it directly
            if (base64String.startsWith("http://") || base64String.startsWith("https://")) {
                return base64String;
            }
            return "";
        }
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(base64String, ObjectUtils.asMap(
                    "folder", "urbaneye_issues"
            ));
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            System.err.println("Error uploading base64 to Cloudinary: " + e.getMessage());
            return "";
        }
    }
}
