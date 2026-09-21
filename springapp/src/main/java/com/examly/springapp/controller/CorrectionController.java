package com.examly.springapp.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.examly.springapp.dto.CorrectionRequest;
import com.examly.springapp.dto.CorrectionUpdateRequest;
import com.examly.springapp.entity.Correction;
import com.examly.springapp.service.CorrectionService;

@RestController
@RequestMapping("/api/corrections")
public class CorrectionController {

    private final CorrectionService correctionService;

    public CorrectionController(CorrectionService correctionService) {
        this.correctionService = correctionService;
    }

    @PostMapping
    public ResponseEntity<Correction> submitCorrectionDirect(
            @RequestBody CorrectionRequest request) {

        return new ResponseEntity<>(
                correctionService.submitCorrection(request),
                HttpStatus.CREATED);
    }

    @PostMapping("/{userId}")
    public ResponseEntity<Correction> submitCorrection(
            @PathVariable Long userId,
            @RequestBody CorrectionRequest request) {

        return new ResponseEntity<>(
                correctionService.submitCorrection(userId, request),
                HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Correction>> getAllCorrections() {
        return ResponseEntity.ok(
                correctionService.getAllCorrections());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Correction> getCorrectionById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                correctionService.getCorrectionById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Correction> updateCorrectionStatus(
            @PathVariable Long id,
            @RequestBody CorrectionUpdateRequest request) {

        return ResponseEntity.ok(
                correctionService.updateCorrection(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteCorrection(
            @PathVariable Long id) {

        correctionService.deleteCorrection(id);

        return ResponseEntity.ok(
                "Correction deleted successfully");
    }
}