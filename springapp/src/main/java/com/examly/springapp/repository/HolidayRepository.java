package com.examly.springapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.examly.springapp.entity.Holiday;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, Long> {

}