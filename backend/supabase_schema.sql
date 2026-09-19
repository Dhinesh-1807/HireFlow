CREATE TABLE candidates (
	id SERIAL NOT NULL, 
	full_name VARCHAR(255) NOT NULL, 
	email VARCHAR(255), 
	phone VARCHAR(50), 
	location VARCHAR(255), 
	linkedin_url VARCHAR(500), 
	github_url VARCHAR(500), 
	portfolio_url VARCHAR(500), 
	summary TEXT, 
	total_experience_years FLOAT, 
	current_title VARCHAR(255), 
	current_company VARCHAR(255), 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE TABLE job_descriptions (
	id SERIAL NOT NULL, 
	title VARCHAR(255) NOT NULL, 
	company VARCHAR(255), 
	department VARCHAR(100), 
	location VARCHAR(255), 
	raw_text TEXT NOT NULL, 
	summary TEXT, 
	min_years_experience FLOAT, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id)
);

CREATE TABLE candidate_job_matches (
	id SERIAL NOT NULL, 
	candidate_id INTEGER NOT NULL, 
	job_id INTEGER NOT NULL, 
	overall_match_score FLOAT NOT NULL, 
	skills_match_score FLOAT, 
	experience_match_score FLOAT, 
	status VARCHAR(50), 
	summary_analysis TEXT, 
	strengths TEXT, 
	gaps TEXT, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	updated_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(candidate_id) REFERENCES candidates (id), 
	FOREIGN KEY(job_id) REFERENCES job_descriptions (id)
);

CREATE TABLE candidate_skills (
	id SERIAL NOT NULL, 
	candidate_id INTEGER NOT NULL, 
	name VARCHAR(100) NOT NULL, 
	category VARCHAR(50), 
	years_of_experience FLOAT, 
	proficiency VARCHAR(50), 
	source_snippet TEXT, 
	source_page INTEGER, 
	PRIMARY KEY (id), 
	FOREIGN KEY(candidate_id) REFERENCES candidates (id)
);

CREATE TABLE educations (
	id SERIAL NOT NULL, 
	candidate_id INTEGER NOT NULL, 
	degree VARCHAR(255), 
	institution VARCHAR(255) NOT NULL, 
	field_of_study VARCHAR(255), 
	graduation_year VARCHAR(50), 
	gpa VARCHAR(50), 
	PRIMARY KEY (id), 
	FOREIGN KEY(candidate_id) REFERENCES candidates (id)
);

CREATE TABLE experiences (
	id SERIAL NOT NULL, 
	candidate_id INTEGER NOT NULL, 
	job_title VARCHAR(255) NOT NULL, 
	company VARCHAR(255) NOT NULL, 
	location VARCHAR(255), 
	start_date VARCHAR(50), 
	end_date VARCHAR(50), 
	is_current INTEGER, 
	description TEXT, 
	technologies_used TEXT, 
	source_snippet TEXT, 
	source_page INTEGER, 
	PRIMARY KEY (id), 
	FOREIGN KEY(candidate_id) REFERENCES candidates (id)
);

CREATE TABLE interview_sessions (
	id SERIAL NOT NULL, 
	candidate_id INTEGER NOT NULL, 
	job_id INTEGER NOT NULL, 
	round_name VARCHAR(100), 
	scheduled_at TIMESTAMP WITHOUT TIME ZONE, 
	status VARCHAR(50), 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(candidate_id) REFERENCES candidates (id), 
	FOREIGN KEY(job_id) REFERENCES job_descriptions (id)
);

CREATE TABLE job_requirements (
	id SERIAL NOT NULL, 
	job_id INTEGER NOT NULL, 
	requirement_text TEXT NOT NULL, 
	category VARCHAR(50) NOT NULL, 
	weight FLOAT, 
	min_experience_years FLOAT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(job_id) REFERENCES job_descriptions (id)
);

CREATE TABLE resumes (
	id SERIAL NOT NULL, 
	candidate_id INTEGER NOT NULL, 
	file_name VARCHAR(255) NOT NULL, 
	file_path VARCHAR(500) NOT NULL, 
	file_size_bytes INTEGER, 
	extracted_text TEXT NOT NULL, 
	page_count INTEGER, 
	pages_data TEXT, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(candidate_id) REFERENCES candidates (id)
);

CREATE TABLE interview_evaluations (
	id SERIAL NOT NULL, 
	session_id INTEGER NOT NULL, 
	overall_rating FLOAT NOT NULL, 
	recommendation VARCHAR(50), 
	technical_competency FLOAT, 
	communication_rating FLOAT, 
	problem_solving_rating FLOAT, 
	strengths TEXT, 
	areas_for_improvement TEXT, 
	executive_summary TEXT, 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(session_id) REFERENCES interview_sessions (id)
);

CREATE TABLE interview_notes (
	id SERIAL NOT NULL, 
	session_id INTEGER NOT NULL, 
	interviewer_name VARCHAR(100), 
	raw_notes TEXT NOT NULL, 
	key_observations TEXT, 
	sentiment VARCHAR(50), 
	created_at TIMESTAMP WITHOUT TIME ZONE, 
	PRIMARY KEY (id), 
	FOREIGN KEY(session_id) REFERENCES interview_sessions (id)
);

CREATE TABLE interview_questions (
	id SERIAL NOT NULL, 
	session_id INTEGER NOT NULL, 
	question_text TEXT NOT NULL, 
	category VARCHAR(50), 
	target_skill_or_gap VARCHAR(255), 
	expected_answer_guidelines TEXT, 
	difficulty VARCHAR(50), 
	order_index INTEGER, 
	PRIMARY KEY (id), 
	FOREIGN KEY(session_id) REFERENCES interview_sessions (id)
);

CREATE TABLE requirement_evidence (
	id SERIAL NOT NULL, 
	match_id INTEGER NOT NULL, 
	requirement_id INTEGER NOT NULL, 
	status VARCHAR(50) NOT NULL, 
	score FLOAT, 
	evidence_quote TEXT, 
	source_page INTEGER, 
	reasoning TEXT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(match_id) REFERENCES candidate_job_matches (id), 
	FOREIGN KEY(requirement_id) REFERENCES job_requirements (id)
);