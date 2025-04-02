-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: unimart
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `cart_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `item_id` int NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`cart_id`),
  KEY `cart_to_item_idx` (`item_id`),
  KEY `cart_to_user_idx` (`user_id`),
  CONSTRAINT `cart_to_item` FOREIGN KEY (`item_id`) REFERENCES `products` (`product_id`),
  CONSTRAINT `cart_to_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,1,2,1),(5,4,15,1);
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `history_itmes`
--

DROP TABLE IF EXISTS `history_itmes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `history_itmes` (
  `history_items_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `item_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `purchase_id` int NOT NULL,
  PRIMARY KEY (`history_items_id`),
  KEY `item_id_idx` (`item_id`),
  KEY `user_id_idx` (`user_id`),
  KEY `purchase_id_idx` (`purchase_id`),
  CONSTRAINT `item_id` FOREIGN KEY (`item_id`) REFERENCES `products` (`product_id`),
  CONSTRAINT `purchase_id` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`purchase_id`),
  CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `history_itmes`
--

LOCK TABLES `history_itmes` WRITE;
/*!40000 ALTER TABLE `history_itmes` DISABLE KEYS */;
/*!40000 ALTER TABLE `history_itmes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `product_name` varchar(45) NOT NULL,
  `seller_id` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `inventory` int NOT NULL DEFAULT 0,
  `p_description` varchar(255) NOT NULL,
  `p_image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `product_id_UNIQUE` (`product_id`),
  KEY `product_to_seller_idx` (`seller_id`),
  CONSTRAINT `product_to_seller` FOREIGN KEY (`seller_id`) REFERENCES `sellers` (`seller_id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'MSU Sweatpants',4,20.00,25,'MSU women\'s sweatpants','msu_sweatpants.jpg'),(2,'Backpack',3,20.00,1,'16-inch sport backpack','backpack.jpg'),(3,'Notebook',4,4.99,5,'wide ruled notebook','notebook.jpg'),(4,'Pencils',3,4.00,2,'24-pack #2 pencils','pencils.jpg'),(5,'Laptop',2,84.36,1,'Macbook','laptop.jpg'),(6,'Clock Radio',1,15.00,3,'AM/FM radio with alarm clock','clock_radio.jpg'),(7, 'Surge Protector', 2, 4.99, 50, '8-socket surge protector', 'surge_protector.jpg'),
(8, 'iPhone Charger', 3, 2.00, 100, 'Lightning to USB charging cord', 'iphone_charger.jpg'),
(9, 'OU Sweatpants', 4, 20.00, 30, 'OU men\'s sweatpants', 'ou_sweatpants_men.jpg'),
(10, 'OU Sweatpants', 4, 20.00, 35, 'OU women\'s sweatpants', 'ou_sweatpants_women.jpg'),
(11, 'UofM Sweatpants', 4, 20.00, 25, 'UofM men\'s sweatpants', 'uofm_sweatpants_men.jpg'),
(12, 'UofM Sweatpants', 4, 20.00, 25, 'UofM women\'s sweatpants', 'uofm_sweatpants_women.jpg'),
(13, 'MSU Sweatpants', 4, 20.00, 25, 'MSU men\'s sweatpants', 'msu_sweatpants_men.jpg'),
(14, 'OU Hoodie', 4, 25.00, 30, 'OU men\'s hoodie', 'ou_hoodie_men.jpg'),
(15, 'OU Hoodie', 4, 25.00, 34, 'OU women\'s hoodie', 'ou_hoodie_women.jpg'),
(16, 'UofM Hoodie', 4, 25.00, 25, 'UofM men\'s hoodie', 'uofm_hoodie_men.jpg'),
(17, 'UofM Hoodie', 4, 25.00, 25, 'UofM women\'s hoodie', 'uofm_hoodie_women.jpg'),
(18, 'MSU Hoodie', 4, 25.00, 25, 'MSU men\'s hoodie', 'msu_hoodie_men.jpg'),
(19, 'MSU Hoodie', 4, 25.00, 25, 'MSU women\'s hoodie', 'msu_hoodie_women.jpg'),
(20, 'Graphing Calculator', 1, 30.00, 15, 'TI-83', 'graphing_calculator.jpg'),
(21, 'Non-Graphing Calculator', 1, 25.00, 15, 'TI-30Xa', 'non_graphing_calculator.jpg'),
(22, 'LED strip lights', 3, 5.00, 3, '30-ft LED strip lights with controller', 'led_strip_lights.jpg'),
(23, 'Dragon Ball Anime Tapestry', 3, 30.00, 1, 'Character design wall tapestry', 'dragon_ball_tapestry.jpg'),
(24, 'Ramen 12-pack', 2, 3.00, 10, 'Maruchan Beef Ramen 12-pack', 'ramen_beef.jpg'),
(25, 'Ramen 12-pack', 2, 3.00, 10, 'Maruchan Shrimp Ramen 12-pack', 'ramen_shrimp.jpg'),
(26, 'Ramen 12-pack', 2, 3.00, 10, 'Maruchan Chicken Ramen 12-pack', 'ramen_chicken.jpg'),
(27, 'Ramen 12-pack', 2, 3.00, 10, 'Maruchan Pork Ramen 12-pack', 'ramen_pork.jpg'),
(28, 'Winter Coat', 1, 10.00, 1, 'Cold-Weather Jacket', 'winter_coat.jpg'),
(29, 'Water Bottle Case', 2, 7.00, 30, 'Ice Mountain 16.9oz Water Bottle 48-pack', 'water_bottle_case.jpg'),
(30, 'Phone Case', 1, 20.00, 5, 'Clear iPhone 15 Case', 'phone_case.jpg'),
(31, 'Pen', 5, 4.00, 34, 'black pen', 'pen.jpg');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchases`
--

DROP TABLE IF EXISTS `purchases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchases` (
  `purchase_id` int NOT NULL AUTO_INCREMENT,
  `buyer_id` int NOT NULL,
  `cart_contents` varchar(45) NOT NULL,
  `cart_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`purchase_id`),
  KEY `purchase_to_buyer_idx` (`buyer_id`),
  CONSTRAINT `purchase_to_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchases`
--

LOCK TABLES `purchases` WRITE;
/*!40000 ALTER TABLE `purchases` DISABLE KEYS */;
/*!40000 ALTER TABLE `purchases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seller_reviews`
--

DROP TABLE IF EXISTS `seller_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seller_reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `comment` varchar(100) DEFAULT NULL,
  `rating` int NOT NULL,
  `review_source` int NOT NULL,
  `review_subject` int NOT NULL,
  PRIMARY KEY (`review_id`),
  KEY `seller_review_to_source_idx` (`review_source`),
  KEY `seller_review_to_subject_idx` (`review_subject`),
  CONSTRAINT `seller_review_to_source` FOREIGN KEY (`review_source`) REFERENCES `users` (`user_id`),
  CONSTRAINT `seller_review_to_subject` FOREIGN KEY (`review_subject`) REFERENCES `sellers` (`seller_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seller_reviews`
--

LOCK TABLES `seller_reviews` WRITE;
/*!40000 ALTER TABLE `seller_reviews` DISABLE KEYS */;
INSERT INTO `seller_reviews` VALUES (1,'Some of the pages were torn in the textbook but otherwise good.',3,5,2),(2,'Kind and easy to work with and product was in great condition.',5,4,2);
/*!40000 ALTER TABLE `seller_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sellers`
--

DROP TABLE IF EXISTS `sellers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sellers` (
  `seller_id` int NOT NULL AUTO_INCREMENT,
  `company_name` varchar(45) NOT NULL,
  `owner_id` int NOT NULL,
  PRIMARY KEY (`seller_id`),
  KEY `seller_to_user_idx` (`owner_id`),
  CONSTRAINT `seller_to_user` FOREIGN KEY (`owner_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sellers`
--

LOCK TABLES `sellers` WRITE;
/*!40000 ALTER TABLE `sellers` DISABLE KEYS */;
INSERT INTO `sellers` VALUES (1,'guy_who_sells',2),(2,'the_original',1),(3,'Abby',3),(4,'boratheseller',11),(5,'Ken',5);
/*!40000 ALTER TABLE `sellers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `tag_id` int NOT NULL AUTO_INCREMENT,
  `tag_name` varchar(45) NOT NULL,
  PRIMARY KEY (`tag_id`),
  UNIQUE KEY `tag_id_UNIQUE` (`tag_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES (1,'Used'),(2,'New'),(3,'Supplies'),(4,'Furniture'),(5,'Electronics'),(6,'Food'),(7,'Clothing');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags_list`
--

DROP TABLE IF EXISTS `tags_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags_list` (
  `tag_list_id` int NOT NULL AUTO_INCREMENT,
  `linked_tag` int NOT NULL,
  `linked_item` int NOT NULL,
  PRIMARY KEY (`tag_list_id`),
  KEY `tag_list_to_tag_idx` (`linked_tag`),
  KEY `tag_list_to_item_idx` (`linked_item`),
  CONSTRAINT `tag_list_to_item` FOREIGN KEY (`linked_item`) REFERENCES `products` (`product_id`),
  CONSTRAINT `tag_list_to_tag` FOREIGN KEY (`linked_tag`) REFERENCES `tags` (`tag_id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags_list`
--

LOCK TABLES `tags_list` WRITE;
/*!40000 ALTER TABLE `tags_list` DISABLE KEYS */;
INSERT INTO `tags_list` VALUES (1,1,2),(2,3,2),(3,2,3),(4,3,3),(5,2,4),(6,3,4),(7,2,1),(8,7,1),(9,1,5),(10,5,5),(11,1,6),(12,5,6),(13,2,7),(14,5,7),(15,5,8),(16,2,8),(17,2,9),(18,7,9),(19,2,10),(20,7,10),(21,2,11),(22,7,11),(23,2,12),(24,7,12),(25,2,13),(26,7,13),(27,2,14),(28,7,14),(29,2,15),(30,7,15),(31,2,16),(32,7,16),(33,2,17),(34,7,17),(35,2,18),(36,7,18),(37,2,19),(38,7,19),(39,6,24),(40,6,25),(41,6,26),(42,6,27);
/*!40000 ALTER TABLE `tags_list` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_info`
--

DROP TABLE IF EXISTS `user_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_info` (
  `info_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `payment_info` varchar(45) DEFAULT NULL,
  `u_password` varchar(255) NOT NULL,
  `email` varchar(45) NOT NULL,
  `wallet_balance` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`info_id`),
  KEY `info_to_user_idx` (`user_id`),
  CONSTRAINT `info_to_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_info`
--

LOCK TABLES `user_info` WRITE;
/*!40000 ALTER TABLE `user_info` DISABLE KEYS */;
INSERT INTO `user_info` VALUES (1,1,NULL,'OGpassword','original@academy.edu',50.00),(2,5,NULL,'kenspassword','ken@place.edu',50.00),(3,3,NULL,'abbyknowsbest','abby@place.edu',50.00),(4,4,NULL,'meganissmart','megan@university.com',50.00),(5,2,NULL,'sellingsogood','buymystuff@school.edu',50.00),(6,6,NULL,'newestpassword','newguy@email.edu',45.01),(7,11,NULL,'$2b$10$95in/0T5SPlnOe/lopUdNeO6sOa20FdDtSOeXLLvveztKfma9VA4S','borakutlu@oakland.edu',0.00);
/*!40000 ALTER TABLE `user_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_reviews`
--

DROP TABLE IF EXISTS `user_reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `comment` varchar(100) DEFAULT NULL,
  `rating` int NOT NULL,
  `comment_subject` int NOT NULL,
  `comment_source` int NOT NULL,
  PRIMARY KEY (`review_id`),
  KEY `comment_to_source_idx` (`comment_source`),
  KEY `comment_to_subject_idx` (`comment_subject`),
  CONSTRAINT `comment_to_source` FOREIGN KEY (`comment_source`) REFERENCES `users` (`user_id`),
  CONSTRAINT `comment_to_subject` FOREIGN KEY (`comment_subject`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_reviews`
--

LOCK TABLES `user_reviews` WRITE;
/*!40000 ALTER TABLE `user_reviews` DISABLE KEYS */;
INSERT INTO `user_reviews` VALUES (1,'Thank you for your purchase of the Backpack',5,1,3);
/*!40000 ALTER TABLE `user_reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username_UNIQUE` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (3,'Abby'),(11,'Bora'),(5,'Ken'),(4,'Megan'),(6,'newusername'),(1,'originalguy'),(8,'paulannoyance'),(2,'sellerdude'),(9,'skinnypete'),(10,'twoarmslouise');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES users(user_id)
);
/*!40101 SET character_set_client = @saved_cs_client */;
--
-- Dumping data for table `messages`
--

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, -- The user who receives the notification
    message TEXT NOT NULL, -- The notification message
    is_read TINYINT(1) DEFAULT 0 , -- Whether the notification has been read
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- When the notification was created
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;



-- Dump completed on 2025-03-18 19:48:32
