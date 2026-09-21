package com.examly.springapp.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.examly.springapp.dto.CorrectionRequest;
import com.examly.springapp.dto.CorrectionUpdateRequest;
import com.examly.springapp.entity.Correction;
import com.examly.springapp.entity.User;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.CorrectionRepository;
import com.examly.springapp.repository.UserRepository;

@Service
public class CorrectionService {

    private final CorrectionRepository correctionRepository;
    private final UserRepository userRepository;

    public CorrectionService(CorrectionRepository correctionRepository,
                             UserRepository userRepository) {
        this.correctionRepository = correctionRepository;
        this.userRepository = userRepository;
    }

    public Correction submitCorrection(Long userId, CorrectionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return saveCorrection(user, request);
    }

    public Correction submitCorrection(CorrectionRequest request) {
        User user = null;
        if (request.getEmployeeId() != null && !request.getEmployeeId().isBlank()) {
            String trimmed = request.getEmployeeId().trim();
            user = userRepository.findByEmployeeId(trimmed)
                    .or(() -> {
                        try {
                            return userRepository.findById(Long.parseLong(trimmed));
                        } catch (Exception e) {
                            return Optional.empty();
                        }
                    })
                    .or(() -> userRepository.findByEmail(trimmed))
                    .orElse(null);
        }
        if (user == null && request.getUserId() != null) {
            user = userRepository.findById(request.getUserId()).orElse(null);
        }
        if (user == null) {
            user = userRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }

        return saveCorrection(user, request);
    }

    private Correction saveCorrection(User user, CorrectionRequest request) {
        Correction correction = new Correction();

        LocalDate date = request.getAttendanceDate();
        if (date == null && request.getDate() != null && !request.getDate().isBlank()) {
            try {
                date = LocalDate.parse(request.getDate());
            } catch (Exception ignored) {
                date = LocalDate.now();
            }
        }
        if (date == null) {
            date = LocalDate.now();
        }

        String reason = request.getReason();
        if (request.getRequestedCheckIn() != null || request.getRequestedCheckOut() != null) {
            String details = String.format(" [In: %s, Out: %s]",
                    request.getRequestedCheckIn() != null ? request.getRequestedCheckIn() : "N/A",
                    request.getRequestedCheckOut() != null ? request.getRequestedCheckOut() : "N/A");
            reason = (reason != null ? reason : "") + details;
        }

        correction.setAttendanceDate(date);
        correction.setReason(reason);
        correction.setStatus("PENDING");
        correction.setUser(user);

        return correctionRepository.save(correction);
    }

    public List<Correction> getAllCorrections() {
        return correctionRepository.findAll();
    }

    public Correction getCorrectionById(Long id) {
        return correctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Correction not found"));
    }

    public Correction updateCorrection(Long id,
                                       CorrectionUpdateRequest request) {
        Correction correction = getCorrectionById(id);
        correction.setStatus(request.getStatus());
        return correctionRepository.save(correction);
    }

    public void deleteCorrection(Long id) {
        Correction correction = getCorrectionById(id);
        correctionRepository.delete(correction);
    }
}