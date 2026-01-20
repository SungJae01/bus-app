package com.example.bus_server;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BusStationService {

    private final BusStationRepository repository;

    @Value("${custom.api.service-key}")
    private String serviceKey;

    @Transactional
    public String syncAllStations() {
        int pageNo = 1;
        int savedCount = 0;

        try {
            while (true) {
                System.out.println("데이터 동기화 중... 현재 " + pageNo + "페이지 요청");

                // stSrch(검색어)를 비워두면 '전체 목록'을 반환하는 특성을 이용합니다.
                String url = "http://ws.bus.go.kr/api/rest/stationinfo/getStationByName"
                        + "?serviceKey=" + serviceKey // (Decoding 키)
                        + "&numOfRows=1000" // 한 번에 1000개씩 많이!
                        + "&pageNo=" + pageNo; // 페이지 번호 증가

                RestTemplate restTemplate = new RestTemplate();
                URI uri = new URI(url);
                String xmlResponse = restTemplate.getForObject(uri, String.class);

                // 응답 파싱
                ObjectMapper mapper = new com.fasterxml.jackson.dataformat.xml.XmlMapper();
                JsonNode root = mapper.readTree(xmlResponse);
                JsonNode msgBody = root.path("msgBody");
                JsonNode items = msgBody.path("itemList");

                // ✨ 종료 조건: 데이터가 아예 없거나(null), 비어있으면 루프 종료
                if (items.isMissingNode() || items.isEmpty()) {
                    System.out.println("✅ 모든 데이터 수신 완료! (총 페이지: " + (pageNo - 1) + ")");
                    break;
                }

                List<BusStation> batchList = new ArrayList<>();
                
                // 데이터가 1개일 경우(Object)와 여러개일 경우(Array) 모두 처리
                if (items.isArray()) {
                    for (JsonNode item : items) {
                        processItem(item, batchList);
                    }
                } else {
                    // 데이터가 딱 1개만 있을 때는 Array가 아니라 Object로 올 수 있음
                    processItem(items, batchList);
                }
                
                // DB에 저장
                if (!batchList.isEmpty()) {
                    repository.saveAll(batchList);
                    savedCount += batchList.size();
                    System.out.println("👉 " + savedCount + "개 저장 중...");
                }
                
                pageNo++; // 다음 페이지로
            }

        } catch (Exception e) {
            e.printStackTrace();
            return "에러 발생: " + e.getMessage();
        }

        return "성공! 총 " + savedCount + "개의 정류장이 DB에 저장되었습니다.";
    }

    // 데이터를 추출해서 리스트에 담는 헬퍼 메서드
    private void processItem(JsonNode item, List<BusStation> batchList) {
        String arsId = item.path("arsId").asText();
        String stNm = item.path("stNm").asText();
        String stId = item.path("stId").asText(); // 9자리 ID

        // 1. 가상 정류장(arsId가 0) 제외
        if (arsId == null || arsId.equals("0") || arsId.isEmpty()) return;
        
        // 2. 이미 DB에 있는 정류장 제외 (중복 방지)
        if (repository.findByArsId(arsId).isPresent()) return;

        BusStation station = new BusStation();
        station.setArsId(arsId);
        station.setStationName(stNm);
        station.setStationId(stId);
        
        batchList.add(station);
    }
}