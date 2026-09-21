package com.examly.springapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRequest {

    private Long userId;
    private String employeeId;
    private String checkInTime;
    private String checkOutTime;

    public AttendanceRequest(Long userId) {
        this.userId = userId;
    }
}