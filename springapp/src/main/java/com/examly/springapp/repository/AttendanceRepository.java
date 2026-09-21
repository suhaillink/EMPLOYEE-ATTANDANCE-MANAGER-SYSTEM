package com.examly.springapp.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.examly.springapp.entity.Attendance;
import com.examly.springapp.entity.User;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByUser(User user);

    Optional<Attendance> findTopByUserOrderByDateDesc(User user);

    Optional<Attendance> findByUserAndDate(User user, LocalDate date);

    List<Attendance> findByUserAndDateBetween(User user, LocalDate startDate, LocalDate endDate);

}