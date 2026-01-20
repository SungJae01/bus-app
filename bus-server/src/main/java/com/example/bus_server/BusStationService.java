package com.example.bus_server;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BusStationService {

    private final BusStationRepository repository;

    // 전체 동기화 메서드 (시간이 좀 걸립니다!)
    @Transactional
    public String syncAllStations() {
        // 👇 여기에 본인의 키를 넣어주세요
        String serviceKey = "LJMRBV8qLF/6dU+l+Od+giR/mgXa0Aq+Mv8D0+cM3lPGYfIFeiaf/uh/6nmy4xOcF2v2iiZd3gfzeJAc8Xd+Yw=="; 
        
        int pageNo = 1;
        int savedCount = 0;

        try {
            // 딱 1페이지만 먼저 테스트 해봅니다 (무한루프 방지)
            while (pageNo <= 1) { 
                System.out.println("API 요청 시작: 페이지 " + pageNo);

                String url = "http://ws.bus.go.kr/api/rest/stationinfo/getStationByName"
                        + "?serviceKey=" + serviceKey
                        + "&numOfRows=1000"
                        + "&pageNo=" + pageNo;

                RestTemplate restTemplate = new RestTemplate();
                URI uri = new URI(url);
                String xmlResponse = restTemplate.getForObject(uri, String.class);

                // 🚨 [중요] 터미널에 받아온 데이터를 출력해서 확인합니다!!
                System.out.println("=====================================");
                System.out.println("API 응답값 확인: " + xmlResponse);
                System.out.println("=====================================");

                ObjectMapper mapper = new com.fasterxml.jackson.dataformat.xml.XmlMapper();
                JsonNode root = mapper.readTree(xmlResponse);
                
                // 에러 메시지인지 확인
                JsonNode headerMsg = root.path("msgHeader").path("headerMsg");
                if (!headerMsg.isMissingNode()) {
                    System.out.println("API 메시지: " + headerMsg.asText());
                }

                JsonNode items = root.path("msgBody").path("itemList");

                if (items.isMissingNode() || items.isEmpty()) {
                    System.out.println("데이터가 비어있습니다. 반복 종료.");
                    break;
                }

                List<BusStation> batchList = new ArrayList<>();
                if (items.isArray()) {
                    for (JsonNode item : items) {
                        String arsId = item.path("arsId").asText();
                        String stNm = item.path("stNm").asText();
                        String stId = item.path("stId").asText();

                        if (arsId == null || arsId.equals("0") || arsId.isEmpty()) continue;
                        if (repository.findByArsId(arsId).isPresent()) continue;

                        BusStation station = new BusStation();
                        station.setArsId(arsId);
                        station.setStationName(stNm);
                        station.setStationId(stId);
                        batchList.add(station);
                    }
                }
                
                repository.saveAll(batchList);
                savedCount += batchList.size();
                pageNo++;
            }

        } catch (Exception e) {
            e.printStackTrace();
            return "에러 발생: " + e.getMessage();
        }

        return "총 " + savedCount + "개의 정류장이 저장되었습니다!";
    }
}