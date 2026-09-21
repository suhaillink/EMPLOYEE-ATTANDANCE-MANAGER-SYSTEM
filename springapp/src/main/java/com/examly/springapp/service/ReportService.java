package com.examly.springapp.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.examly.springapp.entity.Attendance;
import com.examly.springapp.entity.Correction;
import com.examly.springapp.entity.User;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.AttendanceRepository;
import com.examly.springapp.repository.CorrectionRepository;
import com.examly.springapp.repository.UserRepository;

@Service
public class ReportService {

    private final UserRepository userRepository;
    private final AttendanceRepository attendanceRepository;
    private final CorrectionRepository correctionRepository;

    public ReportService(UserRepository userRepository,
                         AttendanceRepository attendanceRepository,
                         CorrectionRepository correctionRepository) {
        this.userRepository = userRepository;
        this.attendanceRepository = attendanceRepository;
        this.correctionRepository = correctionRepository;
    }

    public Map<String, Object> getUserReport(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Attendance> attendances = attendanceRepository.findByUser(user);
        List<Correction> corrections = correctionRepository.findByUser(user);

        double totalHours = attendances.stream()
                .filter(a -> a.getTotalHours() != null)
                .mapToDouble(Attendance::getTotalHours)
                .sum();

        Map<String, Object> report = new HashMap<>();
        report.put("userId", user.getId());
        report.put("name", user.getName());
        report.put("email", user.getEmail());
        report.put("role", user.getRole());
        report.put("totalAttendance", attendances.size());
        report.put("totalCorrections", corrections.size());
        report.put("totalHours", totalHours);
        report.put("attendanceRecords", attendances);
        report.put("correctionRequests", corrections);

        return report;
    }

    public List<Attendance> getAttendanceReport() {
        return attendanceRepository.findAll();
    }

    public Long getTotalUsers() {
        return userRepository.count();
    }

    public Long getTotalAttendance() {
        return attendanceRepository.count();
    }
}