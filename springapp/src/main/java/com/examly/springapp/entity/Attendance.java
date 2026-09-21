package com.examly.springapp.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "attendance")
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;

    private LocalDateTime checkIn;

    private LocalDateTime checkOut;

    private String status;

    private Double totalHours;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"attendances", "corrections", "password"})
    private User user;

    public Double getWorkHours() {
        return totalHours != null ? totalHours : 0.0;
    }

    public void setWorkHours(Double workHours) {
        this.totalHours = workHours;
    }

    @JsonIgnore
    public User getEmployee() {
        return user;
    }

    public void setEmployee(User employee) {
        this.user = employee;
    }

}