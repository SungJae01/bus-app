package com.example.bus_server;

import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import org.springframework.beans.factory.annotation.Value;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BusStationController {

    private final BusStationRepository repository;
    private final BusStationService service;

    @Value("${custom.api.service-key}")
    private String serviceKey;

    // [1] 모든 목록 가져오기 (데이터가 너무 많으면 50개만 끊어서 가져오기)
    // 데이터가 12,000개일 때 findAll()을 하면 앱이 멈출 수 있습니다!
    @GetMapping
    public List<BusStation> getStations() {
        // 임시로 상위 100개만 리턴하거나, 전체를 리턴하되 조심해야 합니다.
        // 여기서는 일단 전체 리턴 (나중에 페이징 적용 가능)
        return repository.findAll(); 
    }

    // [2] 기존 기능: 정류장 저장하기
    @PostMapping
    public BusStation addStation(@RequestBody BusStation station) {
        return repository.save(station);
    }

    // ✨ NEW: 전체 데이터 동기화 버튼용 API
    @PostMapping("/sync")
    public String syncAll() {
        return service.syncAllStations();
    }

    // [3] 실시간 버스 도착 정보 가져오기 (Proxy)
    // React가 이 주소로 정류장ID(arsId)를 보내면, 스프링이 공공데이터포털에 물어보고 답해줍니다.
    @GetMapping("/arrival/{arsId}")
    public JsonNode getBusArrival(@PathVariable String arsId) {
        try {
            // 1. 요청 URL 만들기
            // 서울시 API 주소 (getStationByUid)
            String url = "http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid"
                    + "?serviceKey=" + serviceKey
                    + "&arsId=" + arsId; // 서울은 '정류장 번호(5자리)'로 조회합니다.

            // 2. 실제 데이터 요청하기
            RestTemplate restTemplate = new RestTemplate();
            URI uri = new URI(url); // 인코딩 문제 방지를 위해 URI 객체 사용
            String xmlResponse = restTemplate.getForObject(uri, String.class);

            // 3. XML을 JSON으로 변환하기
            XmlMapper xmlMapper = new XmlMapper();
            JsonNode jsonNode = xmlMapper.readTree(xmlResponse);

            return jsonNode; // React에게 JSON을 던져줍니다!

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    // ✨ 정류장 이름으로 검색하기 (서울시 API)
    // 요청: GET /api/stations/search?keyword=강남
    @GetMapping("/search")
    public JsonNode searchStations(@RequestParam String keyword) {
        try {
            // 서울시 정류장 명칭 검색 API (getStationByName)
            // stSrch: 검색어 (한글)
            String url = "http://ws.bus.go.kr/api/rest/stationinfo/getStationByName"
                    + "?serviceKey=" + serviceKey
                    + "&stSrch=" + keyword; // 검색어

            RestTemplate restTemplate = new RestTemplate();
            URI uri = new URI(url);
            
            String xmlResponse = restTemplate.getForObject(uri, String.class);

            XmlMapper xmlMapper = new XmlMapper();
            return xmlMapper.readTree(xmlResponse);

        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    // ✨ 내 DB에서 정류장 이름으로 검색하기
    // 요청: GET /api/stations/local-search?keyword=강남
    @GetMapping("/local-search")
    public List<BusStation> searchLocalStations(@RequestParam String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return List.of(); // 검색어 없으면 빈 리스트
        }
        return repository.findByStationNameContaining(keyword);
    }

    // ✨ NEW: 정류장 삭제하기
    // 요청: DELETE /api/stations/{id}
    @DeleteMapping("/{id}")
    public String deleteStation(@PathVariable Long id) {
        repository.deleteById(id); // JPA가 알아서 삭제해줍니다.
        return "삭제 완료";
    }
}