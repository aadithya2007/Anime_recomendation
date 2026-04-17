package com.anime.reco.repository;

import com.anime.reco.model.AppNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppNotificationRepository extends JpaRepository<AppNotification, Long> {
    List<AppNotification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<AppNotification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
}
