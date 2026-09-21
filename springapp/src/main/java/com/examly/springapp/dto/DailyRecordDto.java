package com.examly.springapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DailyRecordDto {

    private String date;
    private String checkInTime;
    private String checkOutTime;
    private String status;
    private Double workHours;
}
