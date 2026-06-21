-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 21, 2026 at 12:25 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nust_portal`
--

-- --------------------------------------------------------

--
-- Table structure for table `academic_periods`
--

CREATE TABLE `academic_periods` (
  `id` int(11) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `semester` varchar(20) NOT NULL,
  `is_active` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `academic_periods`
--

INSERT INTO `academic_periods` (`id`, `academic_year`, `semester`, `is_active`, `created_at`) VALUES
(10, '2026', 'Semester 1', 1, '2026-06-04 21:07:58');

-- --------------------------------------------------------

--
-- Table structure for table `deadlines`
--

CREATE TABLE `deadlines` (
  `id` int(11) NOT NULL,
  `deadline_type` varchar(50) NOT NULL,
  `deadline_date` datetime NOT NULL,
  `set_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`) VALUES
(1, 1, 'Department of Computer Science', '2026-06-06 15:48:20'),
(2, 1, 'Department of Informatics', '2026-06-06 15:48:20'),
(3, 2, 'Department of Civil Engineering', '2026-06-06 15:48:20'),
(4, 2, 'Department of Mechanical Engineering', '2026-06-06 15:48:20'),
(5, 3, 'Department of Natural Sciences', '2026-06-06 15:48:20'),
(6, 3, 'Department of Health Sciences', '2026-06-06 15:48:20'),
(7, 4, 'Department of Accounting and Finance', '2026-06-06 15:48:20'),
(8, 4, 'Department of Management', '2026-06-06 15:48:20');

-- --------------------------------------------------------

--
-- Table structure for table `evaluations`
--

CREATE TABLE `evaluations` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `examiner_id` int(11) NOT NULL,
  `examiner_type` varchar(20) NOT NULL,
  `section_a` int(11) NOT NULL,
  `section_b` int(11) NOT NULL,
  `section_c` int(11) NOT NULL,
  `section_d` int(11) NOT NULL,
  `section_e` int(11) NOT NULL,
  `total_mark` int(11) NOT NULL,
  `overall_assessment` text DEFAULT NULL,
  `recommendation` varchar(5) DEFAULT NULL,
  `comment_a` text DEFAULT NULL,
  `comment_b` text DEFAULT NULL,
  `comment_c` text DEFAULT NULL,
  `comment_d` text DEFAULT NULL,
  `comment_e` text DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_released` tinyint(1) DEFAULT 0,
  `released_at` timestamp NULL DEFAULT NULL,
  `is_voided` tinyint(1) DEFAULT 0,
  `voided_reason` varchar(255) DEFAULT NULL,
  `voided_at` timestamp NULL DEFAULT NULL,
  `submitted_to_hdc` tinyint(1) DEFAULT 0,
  `hdc_approved` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `evaluations`
--

INSERT INTO `evaluations` (`id`, `student_id`, `examiner_id`, `examiner_type`, `section_a`, `section_b`, `section_c`, `section_d`, `section_e`, `total_mark`, `overall_assessment`, `recommendation`, `comment_a`, `comment_b`, `comment_c`, `comment_d`, `comment_e`, `submitted_at`, `is_released`, `released_at`, `is_voided`, `voided_reason`, `voided_at`, `submitted_to_hdc`, `hdc_approved`) VALUES
(21, 2, 20, 'external', 15, 22, 16, 18, 8, 79, 'Good', 'a', 'afffd', 'kdd', 'sdff', 'wsff', '7', '2026-06-19 07:31:37', 1, '2026-06-19 07:37:52', 0, NULL, NULL, 1, 1),
(22, 2, 21, 'external', 12, 20, 12, 15, 7, 66, 'Good', 'b', 'ffdkd', 'sddd', 'dff', 'sdfgbh', 'fgjdf', '2026-06-19 07:32:34', 1, '2026-06-19 07:37:52', 0, NULL, NULL, 1, 1),
(23, 2, 4, 'internal', 15, 25, 13, 14, 7, 74, 'Good', 'a', 'dkfkd', 'dgff', 'ckfkdsnfd', 'kckfr', 'dsfdnfdjfd', '2026-06-19 07:34:22', 1, '2026-06-19 07:37:52', 0, NULL, NULL, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `examiner_assignments`
--

CREATE TABLE `examiner_assignments` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `examiner_id` int(11) NOT NULL,
  `examiner_type` varchar(20) NOT NULL,
  `assigned_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `examiner_assignments`
--

INSERT INTO `examiner_assignments` (`id`, `student_id`, `examiner_id`, `examiner_type`, `assigned_at`) VALUES
(29, 2, 20, 'external', '2026-06-19 07:29:37'),
(30, 2, 21, 'external', '2026-06-19 07:29:38'),
(31, 1, 20, 'external', '2026-06-21 08:39:07');

-- --------------------------------------------------------

--
-- Table structure for table `faculties`
--

CREATE TABLE `faculties` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculties`
--

INSERT INTO `faculties` (`id`, `name`, `created_at`) VALUES
(1, 'Faculty of Computing and Informatics', '2026-06-06 15:47:48'),
(2, 'Faculty of Engineering and the Built Environment', '2026-06-06 15:47:48'),
(3, 'Faculty of Health, Natural Resources and Applied Sciences', '2026-06-06 15:47:48'),
(4, 'Faculty of Commerce, Human Sciences and Education', '2026-06-06 15:47:48');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `recipient_id` int(11) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `body` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `is_read`, `created_at`) VALUES
(245, 4, 'New Proposal Submitted', 'Paulina Efriam has submitted a research proposal titled \"Cyber \". Please review it.', 0, '2026-06-19 07:11:38'),
(246, 2, '✅ Proposal Approved by Supervisor', 'Your research proposal has been approved by your supervisor and forwarded to the HOD for HDC review.', 0, '2026-06-19 07:13:25'),
(247, 3, 'Proposal to Review', 'You have been assigned to review the proposal \"Cyber \". Please provide feedback and your decision.', 0, '2026-06-19 07:14:56'),
(248, 22, 'Proposal to Review', 'You have been assigned to review the proposal \"Cyber \". Please provide feedback and your decision.', 0, '2026-06-19 07:15:03'),
(249, 4, 'Proposal Evaluator Update', 'An evaluator approved the proposal \"Cyber \" by Paulina Efriam.', 0, '2026-06-19 07:16:34'),
(250, 4, 'Proposal Evaluator Update', 'An evaluator approved the proposal \"Cyber \" by Paulina Efriam.', 0, '2026-06-19 07:17:08'),
(251, 27, 'Proposal Submitted for HDC', 'The proposal \"Cyber \" by Paulina Efriam has been submitted for the HDC meeting.', 0, '2026-06-19 07:17:38'),
(252, 2, 'Proposal Approved by HDC', 'Your proposal has been approved by the Higher Degrees Committee.', 0, '2026-06-19 07:18:56'),
(253, 4, 'New Thesis Submitted', 'Paulina Efriam has submitted their thesis titled \"Cyber Threats\". Please review it.', 0, '2026-06-19 07:27:58'),
(254, 2, '✅ Thesis Approved by Supervisor', 'Your thesis has been approved by your supervisor. The grading process will now begin.', 0, '2026-06-19 07:28:39'),
(255, 20, 'New Student Assigned', 'You have been assigned as external examiner for Paulina Efriam (PhD). Please log in to submit your evaluation.', 0, '2026-06-19 07:29:39'),
(256, 21, 'New Student Assigned', 'You have been assigned as external examiner for Paulina Efriam (PhD). Please log in to submit your evaluation.', 0, '2026-06-19 07:29:40'),
(257, 27, 'Marks Awaiting HDC Approval', 'The coordinator has submitted the examination marks for Paulina Efriam for HDC approval.', 0, '2026-06-19 07:35:45'),
(258, 4, 'Result Approved by HDC', 'The final mark for Paulina Efriam has been approved by the HDC. You can now release it to the student.', 0, '2026-06-19 07:36:26'),
(259, 13, 'Result Approved by HDC', 'The HDC has approved the final mark for Paulina Efriam. The supervisor will now release it to the student.', 0, '2026-06-19 07:36:26'),
(260, 2, '🎓 Results Released', 'Your thesis examination results have been released by the HOD. Log in to view your final mark and examiner feedback.', 0, '2026-06-19 07:37:53'),
(261, 4, 'Supervision Assignment', 'You have been assigned as the supervisor for Victoria Rehabeam.', 0, '2026-06-19 11:12:27'),
(262, 24, 'Supervisor Updated', 'A supervisor has been assigned to you. Please check your supervision team.', 0, '2026-06-19 11:12:27'),
(263, 4, 'New Proposal Submitted', 'Victoria Rehabeam has submitted a research proposal titled \"cyber\". Please review it.', 0, '2026-06-19 11:14:10'),
(264, 24, '✅ Proposal Approved by Supervisor', 'Your research proposal has been approved by your supervisor and forwarded to the HOD for HDC review.', 0, '2026-06-19 11:15:09'),
(265, 3, 'Proposal to Review', 'You have been assigned to review the proposal \"cyber\". Please provide feedback and your decision.', 0, '2026-06-19 11:15:37'),
(266, 22, 'Proposal to Review', 'You have been assigned to review the proposal \"cyber\". Please provide feedback and your decision.', 0, '2026-06-19 11:15:45'),
(267, 4, 'Proposal Evaluator Update', 'An evaluator approved the proposal \"cyber\" by Victoria Rehabeam.', 0, '2026-06-19 11:16:41'),
(268, 4, 'Proposal Evaluator Update', 'An evaluator approved the proposal \"cyber\" by Victoria Rehabeam.', 0, '2026-06-19 11:16:59'),
(269, 27, 'Proposal Submitted for HDC', 'The proposal \"cyber\" by Victoria Rehabeam has been submitted for the HDC meeting.', 0, '2026-06-19 11:17:38'),
(270, 24, 'Proposal Approved by HDC', 'Your proposal has been approved by the Higher Degrees Committee.', 0, '2026-06-19 11:18:53'),
(271, 3, 'New Proposal Submitted', 'David Mbidi has submitted a research proposal titled \"Cyber Threats \". Please review it.', 0, '2026-06-21 08:27:02'),
(272, 22, 'New Proposal Submitted', 'David Mbidi has submitted a research proposal titled \"Cyber Threats \". Please review it.', 0, '2026-06-21 08:27:02'),
(273, 1, '✅ Proposal Approved by Supervisor', 'Your research proposal has been approved by your supervisor and forwarded to the HOD for HDC review.', 0, '2026-06-21 08:27:43'),
(274, 4, 'Proposal to Review', 'You have been assigned to review the proposal \"Cyber Threats \". Please provide feedback and your decision.', 0, '2026-06-21 08:28:15'),
(275, 22, 'Proposal to Review', 'You have been assigned to review the proposal \"Cyber Threats \". Please provide feedback and your decision.', 0, '2026-06-21 08:28:24'),
(276, 3, 'Proposal Evaluator Update', 'An evaluator approved the proposal \"Cyber Threats \" by David Mbidi.', 0, '2026-06-21 08:29:00'),
(277, 3, 'Proposal Evaluator Update', 'An evaluator approved the proposal \"Cyber Threats \" by David Mbidi.', 0, '2026-06-21 08:29:24'),
(278, 27, 'Proposal Submitted for HDC', 'The proposal \"Cyber Threats \" by David Mbidi has been submitted for the HDC meeting.', 0, '2026-06-21 08:29:41'),
(279, 1, 'Proposal Approved by HDC', 'Your proposal has been approved by the Higher Degrees Committee.', 0, '2026-06-21 08:30:03'),
(280, 3, 'New Thesis Submitted', 'David Mbidi has submitted their thesis titled \"dfjfdjvfdjkdj\". Please review it.', 0, '2026-06-21 08:38:22'),
(281, 22, 'New Thesis Submitted', 'David Mbidi has submitted their thesis titled \"dfjfdjvfdjkdj\". Please review it.', 0, '2026-06-21 08:38:22'),
(282, 1, '✅ Thesis Approved by Supervisor', 'Your thesis has been approved by your supervisor. The grading process will now begin.', 0, '2026-06-21 08:38:44'),
(283, 20, 'New Student Assigned', 'You have been assigned as external examiner for David Mbidi (Masters). Please log in to submit your evaluation.', 0, '2026-06-21 08:39:08');

-- --------------------------------------------------------

--
-- Table structure for table `presentations`
--

CREATE TABLE `presentations` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `defence_date` date DEFAULT NULL,
  `defence_time` varchar(20) DEFAULT NULL,
  `venue` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `programmes`
--

CREATE TABLE `programmes` (
  `id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `degree_type` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `programmes`
--

INSERT INTO `programmes` (`id`, `department_id`, `name`, `degree_type`, `created_at`) VALUES
(1, 1, 'MSc Computer Science', 'Masters', '2026-06-06 15:49:41'),
(2, 1, 'PhD Computer Science', 'PhD', '2026-06-06 15:49:41'),
(3, 2, 'MSc Informatics', 'Masters', '2026-06-06 15:49:41'),
(4, 3, 'MSc Civil Engineering', 'Masters', '2026-06-06 15:49:41'),
(5, 3, 'PhD Civil Engineering', 'PhD', '2026-06-06 15:49:41'),
(6, 5, 'MSc Natural Sciences', 'Masters', '2026-06-06 15:49:41'),
(7, 6, 'PhD Health Sciences', 'PhD', '2026-06-06 15:49:41');

-- --------------------------------------------------------

--
-- Table structure for table `progress_reports`
--

CREATE TABLE `progress_reports` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `semester` varchar(50) NOT NULL,
  `research_problem` text DEFAULT NULL,
  `objectives` text DEFAULT NULL,
  `activities_completed` text DEFAULT NULL,
  `activities_in_progress` text DEFAULT NULL,
  `activities_outstanding` text DEFAULT NULL,
  `on_schedule` varchar(5) DEFAULT NULL,
  `on_budget` varchar(5) DEFAULT NULL,
  `on_target` varchar(5) DEFAULT NULL,
  `adjustments` text DEFAULT NULL,
  `challenges` text DEFAULT NULL,
  `risks` text DEFAULT NULL,
  `student_comments` text DEFAULT NULL,
  `supervisor_comments` text DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `report_number` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proposals`
--

CREATE TABLE `proposals` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Pending HDC Review',
  `hdc_decision` varchar(20) DEFAULT 'Pending',
  `hdc_comments` text DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `supervisor_status` varchar(20) DEFAULT 'Pending',
  `supervisor_comments` text DEFAULT NULL,
  `version` int(11) DEFAULT 1,
  `ethics_file` varchar(255) DEFAULT NULL,
  `ethics_status` varchar(20) DEFAULT 'Not Submitted',
  `faculty_status` varchar(20) DEFAULT 'Pending',
  `faculty_approved_by` int(11) DEFAULT NULL,
  `faculty_comments` text DEFAULT NULL,
  `faculty_approved_at` timestamp NULL DEFAULT NULL,
  `ethics_involves_humans` varchar(10) DEFAULT NULL,
  `ethics_data_methods` text DEFAULT NULL,
  `ethics_risks` text DEFAULT NULL,
  `ethics_consent_process` text DEFAULT NULL,
  `ethics_data_protection` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `proposals`
--

INSERT INTO `proposals` (`id`, `student_id`, `title`, `description`, `file_name`, `status`, `hdc_decision`, `hdc_comments`, `submitted_at`, `supervisor_status`, `supervisor_comments`, `version`, `ethics_file`, `ethics_status`, `faculty_status`, `faculty_approved_by`, `faculty_comments`, `faculty_approved_at`, `ethics_involves_humans`, `ethics_data_methods`, `ethics_risks`, `ethics_consent_process`, `ethics_data_protection`) VALUES
(37, 2, 'Cyber ', 'THdhf', '1781853096828-Research Proposal David Mbidi.pdf', 'Approved', 'approved', NULL, '2026-06-19 07:11:37', 'approved', 'Godd', 1, NULL, 'Submitted', 'Approved', 27, 'Good', '2026-06-19 07:18:55', 'Yes', 'interview ', 'fhg', 'ff', 'dfjj'),
(38, 24, 'cyber', 'cyber threats', '1781867649476-Research Proposal David Mbidi.pdf', 'Approved', 'approved', NULL, '2026-06-19 11:14:09', 'approved', 'fjfjf', 1, NULL, 'Submitted', 'Approved', 27, 'dkkhf', '2026-06-19 11:18:52', 'No', 'fkgfkkg', 'dkfkfdkr', 'ggfl', 'dlfj'),
(39, 1, 'Cyber Threats ', 'How to prevent cyber threats ', '1782030419562-Cybersecurity Proposal Paulina.pdf', 'Approved', 'approved', NULL, '2026-06-21 08:27:00', 'approved', 'jhjdffvfjdvdfkj', 1, NULL, 'Not Submitted', 'Approved', 27, 'Good Proceed', '2026-06-21 08:30:00', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `proposal_reviews`
--

CREATE TABLE `proposal_reviews` (
  `id` int(11) NOT NULL,
  `proposal_id` int(11) NOT NULL,
  `evaluator_id` int(11) NOT NULL,
  `feedback` text DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `proposal_reviews`
--

INSERT INTO `proposal_reviews` (`id`, `proposal_id`, `evaluator_id`, `feedback`, `status`, `created_at`, `updated_at`) VALUES
(8, 37, 3, 'good work', 'Approved', '2026-06-19 07:14:54', '2026-06-19 07:16:34'),
(9, 37, 22, 'No issues here', 'Approved', '2026-06-19 07:15:02', '2026-06-19 07:17:07'),
(10, 38, 3, 'djfjf', 'Approved', '2026-06-19 11:15:37', '2026-06-19 11:16:58'),
(11, 38, 22, 'rdjs', 'Approved', '2026-06-19 11:15:43', '2026-06-19 11:16:41'),
(12, 39, 4, 'Good ', 'Approved', '2026-06-21 08:28:14', '2026-06-21 08:28:59'),
(13, 39, 22, 'Good', 'Approved', '2026-06-21 08:28:24', '2026-06-21 08:29:24');

-- --------------------------------------------------------

--
-- Table structure for table `student_semesters`
--

CREATE TABLE `student_semesters` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `semester_label` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'registered',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `theses`
--

CREATE TABLE `theses` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `abstract` text DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `status` varchar(100) DEFAULT 'Submitted — Awaiting Examiner Assignment',
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `supervisor_status` varchar(20) DEFAULT 'Pending',
  `supervisor_comments` text DEFAULT NULL,
  `version` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `theses`
--

INSERT INTO `theses` (`id`, `student_id`, `title`, `abstract`, `file_name`, `status`, `submitted_at`, `supervisor_status`, `supervisor_comments`, `version`) VALUES
(17, 2, 'Cyber Threats', 'fhghf', '1781854077681-Thesis Cybersecurity Paulina.pdf', 'Under Examination', '2026-06-19 07:27:57', 'approved', 'Good work', 1),
(18, 1, 'dfjfdjvfdjkdj', 'fjkdfkjbfnbdb', '1782031102311-Thesis Cybersecurity Paulina.pdf', 'Under Examination', '2026-06-21 08:38:22', 'approved', 'gnbgnbgfnbfgnb', 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL,
  `degree` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `supervisor_id` int(11) DEFAULT NULL,
  `faculty_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `programme_id` int(11) DEFAULT NULL,
  `co_supervisor_id` int(11) DEFAULT NULL,
  `is_pg_subscriber` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `degree`, `created_at`, `supervisor_id`, `faculty_id`, `department_id`, `programme_id`, `co_supervisor_id`, `is_pg_subscriber`) VALUES
(1, 'David Mbidi', '222012345@nust.na', 'student123', 'student', 'Masters', '2026-04-12 16:01:24', 3, 1, 1, 1, 22, 0),
(2, 'Paulina Efriam', '221098765@nust.na', 'phd123', 'student', 'PhD', '2026-04-12 16:01:24', 4, 1, 1, 2, NULL, 0),
(3, 'Dr. Simon ', 'joel.eelu@nust.na', 'sup123', 'supervisor', NULL, '2026-04-12 16:01:24', NULL, 1, 1, NULL, NULL, 0),
(4, 'Prof. Filimon Supervisor', 'fili.nghidengwa@nust.na', 'supervisor123', 'supervisor', NULL, '2026-04-12 16:01:24', NULL, 1, 1, NULL, NULL, 0),
(8, 'Prof. Civil Coord', 'civil.coord@nust.na', 'sup123', 'supervisor', NULL, '2026-06-06 16:03:31', NULL, 2, 3, NULL, NULL, 0),
(9, 'Dr. Civil Supervisor', 'civil.supervisor@nust.na', 'supervisor123', 'supervisor', NULL, '2026-06-06 16:03:31', NULL, 2, 3, NULL, NULL, 0),
(10, 'Tangeni Undergraduate', '224567890@nust.na', 'demo123', 'undergraduate', NULL, '2026-06-06 16:11:11', NULL, NULL, NULL, NULL, NULL, 1),
(11, 'John Junior Lecturer', 'john.junior@nust.na', 'demo123', 'junior_lecturer', NULL, '2026-06-06 16:11:11', NULL, NULL, NULL, NULL, NULL, 0),
(12, 'Mary Secretary', 'mary.admin@nust.na', 'demo123', 'admin_staff', NULL, '2026-06-06 16:11:11', NULL, NULL, NULL, NULL, NULL, 0),
(13, 'Dr. Nashilongo Coordinator', 'coordinator@nust.na', 'coord123', 'coordinator', NULL, '2026-06-06 18:00:29', NULL, 1, 1, NULL, NULL, 0),
(14, 'Dr. Hamutenya Coordinator', 'civil.coordinator@nust.na', 'coord123', 'coordinator', NULL, '2026-06-07 13:48:57', NULL, 2, 3, NULL, NULL, 0),
(15, 'Johannes Amukwa', '223009988@nust.na', 'student123', 'student', 'PhD', '2026-06-07 13:48:59', NULL, 2, 3, 5, NULL, 0),
(20, 'Daniel', 'daniel@nust.na', 'danie234', 'examiner', NULL, '2026-06-10 20:15:39', NULL, 1, 1, NULL, NULL, 0),
(21, 'Tarun', 'tarun@nust.na', 'tarun123', 'examiner', NULL, '2026-06-10 20:16:10', NULL, 1, 1, NULL, NULL, 0),
(22, 'Dr Anna Shilongo', 'anna.shilongo@nust.na', 'supervisor123', 'supervisor', NULL, '2026-06-11 18:53:41', NULL, 1, 1, NULL, NULL, 0),
(23, 'Delson Natangwe', 'natangue@nust.na', 'delson123', 'student', 'Masters', '2026-06-11 21:25:50', NULL, 1, 1, 1, NULL, 0),
(24, 'Victoria Rehabeam', '211937536@nust.na', 'victoria123', 'student', 'PhD', '2026-06-11 21:42:09', 4, 1, 1, 2, NULL, 0),
(25, 'Ndeya Taapopi', '220847145@nust.na', 'ndeya123', 'student', 'PhD', '2026-06-11 21:47:48', NULL, 2, 3, 5, NULL, 0),
(26, 'Bianca Rachel', '222936903@nust.na', 'bianca123', 'student', 'Masters', '2026-06-11 21:52:34', NULL, 2, 3, 4, NULL, 0),
(27, 'Prof Suama Petrus', 'faculty.rep@nust.na', 'rep123', 'faculty_rep', NULL, '2026-06-14 12:18:02', NULL, 1, NULL, NULL, NULL, 0),
(28, 'System Administrator', 'superadmin@nust.na', 'super123', 'super_admin', NULL, '2026-06-14 16:47:13', NULL, NULL, NULL, NULL, NULL, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academic_periods`
--
ALTER TABLE `academic_periods`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `deadlines`
--
ALTER TABLE `deadlines`
  ADD PRIMARY KEY (`id`),
  ADD KEY `set_by` (`set_by`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `faculty_id` (`faculty_id`);

--
-- Indexes for table `evaluations`
--
ALTER TABLE `evaluations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `examiner_id` (`examiner_id`);

--
-- Indexes for table `examiner_assignments`
--
ALTER TABLE `examiner_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `examiner_id` (`examiner_id`);

--
-- Indexes for table `faculties`
--
ALTER TABLE `faculties`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `presentations`
--
ALTER TABLE `presentations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `programmes`
--
ALTER TABLE `programmes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `department_id` (`department_id`);

--
-- Indexes for table `progress_reports`
--
ALTER TABLE `progress_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `proposals`
--
ALTER TABLE `proposals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `proposal_reviews`
--
ALTER TABLE `proposal_reviews`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `student_semesters`
--
ALTER TABLE `student_semesters`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `theses`
--
ALTER TABLE `theses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `supervisor_id` (`supervisor_id`),
  ADD KEY `faculty_id` (`faculty_id`),
  ADD KEY `department_id` (`department_id`),
  ADD KEY `programme_id` (`programme_id`),
  ADD KEY `co_supervisor_id` (`co_supervisor_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `academic_periods`
--
ALTER TABLE `academic_periods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `deadlines`
--
ALTER TABLE `deadlines`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `evaluations`
--
ALTER TABLE `evaluations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `examiner_assignments`
--
ALTER TABLE `examiner_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `faculties`
--
ALTER TABLE `faculties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=284;

--
-- AUTO_INCREMENT for table `presentations`
--
ALTER TABLE `presentations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `programmes`
--
ALTER TABLE `programmes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `progress_reports`
--
ALTER TABLE `progress_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `proposals`
--
ALTER TABLE `proposals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT for table `proposal_reviews`
--
ALTER TABLE `proposal_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `student_semesters`
--
ALTER TABLE `student_semesters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `theses`
--
ALTER TABLE `theses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `deadlines`
--
ALTER TABLE `deadlines`
  ADD CONSTRAINT `deadlines_ibfk_1` FOREIGN KEY (`set_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `departments`
--
ALTER TABLE `departments`
  ADD CONSTRAINT `departments_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`id`);

--
-- Constraints for table `evaluations`
--
ALTER TABLE `evaluations`
  ADD CONSTRAINT `evaluations_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `evaluations_ibfk_2` FOREIGN KEY (`examiner_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `examiner_assignments`
--
ALTER TABLE `examiner_assignments`
  ADD CONSTRAINT `examiner_assignments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `examiner_assignments_ibfk_2` FOREIGN KEY (`examiner_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `programmes`
--
ALTER TABLE `programmes`
  ADD CONSTRAINT `programmes_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);

--
-- Constraints for table `progress_reports`
--
ALTER TABLE `progress_reports`
  ADD CONSTRAINT `progress_reports_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `proposals`
--
ALTER TABLE `proposals`
  ADD CONSTRAINT `proposals_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `theses`
--
ALTER TABLE `theses`
  ADD CONSTRAINT `theses_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`id`),
  ADD CONSTRAINT `users_ibfk_3` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`),
  ADD CONSTRAINT `users_ibfk_4` FOREIGN KEY (`programme_id`) REFERENCES `programmes` (`id`),
  ADD CONSTRAINT `users_ibfk_5` FOREIGN KEY (`co_supervisor_id`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
