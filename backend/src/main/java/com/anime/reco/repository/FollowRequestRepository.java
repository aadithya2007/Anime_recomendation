package com.anime.reco.repository;

import com.anime.reco.model.FollowRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FollowRequestRepository extends JpaRepository<FollowRequest, Long> {
    List<FollowRequest> findByTargetIdAndStatusOrderByCreatedAtDesc(Long targetId, String status);
    boolean existsByRequesterIdAndTargetIdAndStatus(Long requesterId, Long targetId, String status);

    @Query("""
            SELECT fr
            FROM FollowRequest fr
            WHERE fr.status = :status
              AND (
                (fr.requester.id = :userA AND fr.target.id = :userB)
                OR
                (fr.requester.id = :userB AND fr.target.id = :userA)
              )
            """)
    List<FollowRequest> findPendingBetweenUsers(@Param("userA") Long userA,
                                                @Param("userB") Long userB,
                                                @Param("status") String status);
}
