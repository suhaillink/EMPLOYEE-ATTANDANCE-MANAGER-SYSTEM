package com.examly.springapp.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.examly.springapp.entity.Holiday;
import com.examly.springapp.exception.ResourceNotFoundException;
import com.examly.springapp.repository.HolidayRepository;

@Service
public class HolidayService {

    private final HolidayRepository holidayRepository;

    public HolidayService(HolidayRepository holidayRepository) {
        this.holidayRepository = holidayRepository;
    }

    public Holiday addHoliday(Holiday holiday) {
        return holidayRepository.save(holiday);
    }

    public List<Holiday> getAllHolidays() {
        return holidayRepository.findAll();
    }

    public Holiday getHolidayById(Long id) {
        return holidayRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Holiday not found"));
    }

    public Holiday updateHoliday(Long id, Holiday updatedHoliday) {

        Holiday holiday = getHolidayById(id);

        holiday.setHolidayName(updatedHoliday.getHolidayName());
        holiday.setHolidayDate(updatedHoliday.getHolidayDate());
        holiday.setDescription(updatedHoliday.getDescription());

        return holidayRepository.save(holiday);
    }

    public void deleteHoliday(Long id) {

        Holiday holiday = getHolidayById(id);
        holidayRepository.delete(holiday);

    }

}