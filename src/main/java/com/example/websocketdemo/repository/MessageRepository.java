package com.example.websocketdemo.repository;

import com.example.websocketdemo.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    /* ---------- Basic query methods ---------- */

    // All messages sent by a user
    List<Message> findBySender(String sender);

    // All messages received by a specific user (private)
    List<Message> findByReceiver(String receiver);

    // All public messages (receiver is null)
    List<Message> findByReceiverIsNull();

    /* ---------- Paginated queries ---------- */

    Page<Message> findByReceiverIsNull(Pageable pageable);
    Page<Message> findByReceiver(String receiver, Pageable pageable);

    /* ---------- Ordered message history ---------- */

    List<Message> findBySenderOrderByTimestampDesc(String sender);
    List<Message> findByReceiverOrderByTimestampDesc(String receiver);
    List<Message> findByReceiverIsNullOrderByTimestampDesc();

    /* ---------- Paginated + ordered message history ---------- */

    Page<Message> findByReceiverOrderByTimestampDesc(String receiver, Pageable pageable);
    Page<Message> findByReceiverIsNullOrderByTimestampDesc(Pageable pageable);

    /* ---------- Extra useful queries ---------- */

    // Full conversation between two users (A ↔ B)
    List<Message> findBySenderAndReceiverOrReceiverAndSenderOrderByTimestampAsc(
            String sender1, String receiver1,
            String sender2, String receiver2
    );
}
