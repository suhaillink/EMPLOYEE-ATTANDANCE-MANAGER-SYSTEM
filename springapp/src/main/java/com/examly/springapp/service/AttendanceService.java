package com.examly.springapp.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.examly.springapp.dto.AttendanceReportDto;
import com.examly.springapp.dto.AttendanceRequest;
import com.examly.springapp.dto.DailyRecordDto;
import com.examly.springapp.entity.Attendance;
import com.examly.springapp.entity.User;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.AttendanceRepository;
import com.examly.springapp.repository.UserRepository;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             UserRepository userRepository) {
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
    }

    private User findUser(String employeeId, Long userId) {
        if (employeeId != null && !employeeId.trim().isEmpty()) {
            String trimmed = employeeId.trim();
            Optional<User> byEmpId = userRepository.findByEmployeeId(trimmed);
            if (byEmpId.isPresent()) return byEmpId.get();

            try {
                Long numericId = Long.parseLong(trimmed);
                Optional<User> byId = userRepository.findById(numericId);
                if (byId.isPresent()) return byId.get();
            } catch (NumberFormatException ignored) {}

            Optional<User> byEmail = userRepository.findByEmail(trimmed);
            if (byEmail.isPresent()) return byEmail.get();
        }
        if (userId != null) {
            return userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Employee not found"));
        }
        throw new RuntimeException("Employee not found");
    }

    public Attendance checkIn(Long userId) {
        AttendanceRequest request = new AttendanceRequest();
        request.setUserId(userId);
        return checkIn(request);
    }

    public Attendance checkIn(AttendanceRequest request) {
        User user = findUser(request.getEmployeeId(), request.getUserId());

        LocalDateTime checkInDateTime = LocalDateTime.now();
        if (request.getCheckInTime() != null && !request.getCheckInTime().isBlank()) {
            try {
                checkInDateTime = LocalDateTime.parse(request.getCheckInTime());
            } catch (Exception e) {
                try {
                    checkInDateTime = LocalDate.parse(request.getCheckInTime()).atTime(9, 0);
                } catch (Exception ignored) {}
            }
        }

        LocalDate attendanceDate = checkInDateTime.toLocalDate();

        Optional<Attendance> existing = attendanceRepository.findByUserAndDate(user, attendanceDate);
        if (existing.isPresent()) {
            throw new RuntimeException("Already checked in today");
        }

        Attendance attendance = new Attendance();
        attendance.setUser(user);
        attendance.setDate(attendanceDate);
        attendance.setCheckIn(checkInDateTime);
        attendance.setStatus("Present");
        attendance.setTotalHours(0.0);

        return attendanceRepository.save(attendance);
    }

    public Attendance checkOut(Long userId) {
        AttendanceRequest request = new AttendanceRequest();
        request.setUserId(userId);
        return checkOut(request);
    }

    public Attendance checkOut(AttendanceRequest request) {
        User user = findUser(request.getEmployeeId(), request.getUserId());

        LocalDateTime checkOutDateTime = LocalDateTime.now();
        if (request.getCheckOutTime() != null && !request.getCheckOutTime().isBlank()) {
            try {
                checkOutDateTime = LocalDateTime.parse(request.getCheckOutTime());
            } catch (Exception e) {
                try {
                    checkOutDateTime = LocalDate.parse(request.getCheckOutTime()).atTime(17, 30);
                } catch (Exception ignored) {}
            }
        }

        LocalDate attendanceDate = checkOutDateTime.toLocalDate();

        Attendance attendance = attendanceRepository.findByUserAndDate(user, attendanceDate)
                .or(() -> attendanceRepository.findTopByUserOrderByDateDesc(user))
                .orElseThrow(() -> new RuntimeException("Must check in before check out"));

        if (attendance.getCheckIn() == null) {
            throw new RuntimeException("Must check in before check out");
        }

        attendance.setCheckOut(checkOutDateTime);

        double minutes = Duration.between(attendance.getCheckIn(), attendance.getCheckOut()).toMinutes();
        double hours = Math.round((minutes / 60.0) * 10.0) / 10.0;
        attendance.setTotalHours(hours);

        if (hours < 5.0) {
            attendance.setStatus("Half-day");
        } else {
            attendance.setStatus("Present");
        }

        return attendanceRepository.save(attendance);
    }

    public AttendanceReportDto getAttendanceReport(String employeeId, Integer year, Integer month) {
        User user = userRepository.findByEmployeeId(employeeId)
                .or(() -> {
                    try {
                        return userRepository.findById(Long.parseLong(employeeId));
                    } catch (Exception e) {
                        return Optional.empty();
                    }
                })
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        List<Attendance> attendances;
        if (year != null && month != null) {
            LocalDate start = LocalDate.of(year, month, 1);
            LocalDate end = start.plusMonths(1).minusDays(1);
            attendances = attendanceRepository.findByUserAndDateBetween(user, start, end);
        } else {
            attendances = attendanceRepository.findByUser(user);
        }

        int present = 0;
        int halfDays = 0;
        int absent = 0;
        double totalHours = 0.0;
        List<DailyRecordDto> records = new ArrayList<>();

        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss");

        for (Attendance a : attendances) {
            String status = a.getStatus() != null ? a.getStatus() : "Present";
            if ("Half-day".equalsIgnoreCase(status) || "Half Day".equalsIgnoreCase(status)) {
                halfDays++;
            } else if ("Absent".equalsIgnoreCase(status)) {
                absent++;
            } else {
                present++;
            }

            double hours = a.getTotalHours() != null ? a.getTotalHours() : 0.0;
            totalHours += hours;

            String inTime = a.getCheckIn() != null ? a.getCheckIn().format(timeFormatter) : null;
            String outTime = a.getCheckOut() != null ? a.getCheckOut().format(timeFormatter) : null;

            records.add(new DailyRecordDto(
                    a.getDate() != null ? a.getDate().toString() : "",
                    inTime,
                    outTime,
                    status,
                    hours
            ));
        }

        int totalDays = attendances.size();
        double avgHours = totalDays > 0 ? (Math.round((totalHours / totalDays) * 10.0) / 10.0) : 0.0;

        AttendanceReportDto report = new AttendanceReportDto();
        report.setEmployeeId(user.getEmployeeId() != null ? user.getEmployeeId() : user.getId().toString());
        report.setEmployeeName(user.getName());
        report.setYear(year != null ? year : LocalDate.now().getYear());
        report.setMonth(month != null ? month : LocalDate.now().getMonthValue());
        report.setTotalWorkDays(totalDays);
        report.setPresentDays(present);
        report.setHalfDays(halfDays);
        report.setAbsentDays(absent);
        report.setTotalWorkHours(totalHours);
        report.setAverageWorkHours(avgHours);
        report.setDailyRecords(records);

        return report;
    }

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    public Attendance getAttendanceById(Long id) {
        return attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found"));
    }

    public void deleteAttendance(Long id) {
        Attendance attendance = getAttendanceById(id);
        attendanceRepository.delete(attendance);
    }
}