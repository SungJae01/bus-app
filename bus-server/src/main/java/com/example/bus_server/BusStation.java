package com.example.bus_server;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor
public class BusStation {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String stationId;
    private String stationName;
    private String adirection;

    // ✨ [중요] arsId(정류장번호)는 중복되면 안 됨! (unique = true)
    @Column(unique = true)
    private String arsId;

    // 데이터를 쉽게 넣기 위한 생성자
    public BusStation(String stationId, String stationName, String arsId, String adirection) {
        this.stationId = stationId;
        this.stationName = stationName;
        this.arsId = arsId;
        this.adirection = adirection;
    }

    // Getter & Setter (Lombok @Data를 쓴다면 생략 가능)
    public String getAdirection() { return adirection; }
    public void setAdirection(String adirection) { this.adirection = adirection; }
}