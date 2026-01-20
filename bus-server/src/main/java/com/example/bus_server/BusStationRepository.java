package com.example.bus_server;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BusStationRepository extends JpaRepository<BusStation, Long> {
    // 정류장 번호(arsId)로 이미 있는지 찾아보는 기능
    Optional<BusStation> findByArsId(String arsId);

    // NEW: 정류장 이름에 특정 단어가 포함된 것 찾기 (LIKE %keyword%)
    List<BusStation> findByStationNameContaining(String keyword);
}