USE sakila

-- 1a. First and Last names
SELECT first_name, last_name FROM actor;

-- 1b. Concat and upper full name
SELECT upper(concat(first_name, " ", last_name)) as "Actor Name" FROM actor;

-- 2a. Search for actors with first name Joe
SELECT actor_id, first_name, last_name FROM actor
WHERE first_name = "Joe";

-- 2b. Search for actors with "GEN" in last name
SELECT actor_id, first_name, last_name FROM actor
WHERE last_name LIKE "%GEN%";

-- 2c. Search for actors with "LI" in last name, order by last name
SELECT actor_id, first_name, last_name FROM actor
WHERE last_name LIKE "%LI%"
ORDER BY last_name, first_name;

-- 2d. Display country id and country for Afghanistan, Bangladesh, and China
SELECT country_id, country FROM country
WHERE country IN("Afghanistan", "Bangladesh", "China");

-- 3a. Add blob column to actor table called 'description'
ALTER TABLE actor
ADD description BLOB;

-- 3b. Delete 'description' column
ALTER TABLE actor
DROP description;

-- 4a. List unique last names and count of names
SELECT last_name AS "Last Names", COUNT(*) as "Last Name Count" FROM actor GROUP BY last_name;

-- 4b. List unique last names and count of names when count is more than 2
SELECT last_name AS "Last Names", COUNT(*) as "Last Name Count" FROM actor GROUP BY last_name
HAVING COUNT(*) > 1;

-- 4c. Update incorrect name
SET SQL_SAFE_UPDATES = 0;
UPDATE actor
SET first_name = "HARPO"
WHERE first_name = "GROUCHO";

-- 4d. Correct correction
UPDATE actor
SET first_name = "GROUCHO"
WHERE first_name = "HARPO";

-- 5a. Locate schema of address table
SHOW CREATE TABLE address

-- 6a. Join staff with address
SELECT staff.first_name, staff.last_name, address.address, address.address2, address.postal_code
FROM staff
INNER JOIN address ON
staff.address_id=address.address_id;

-- 6b. Join staff with payment to find total payments by staff
SELECT staff.staff_id, staff.first_name, staff.last_name, SUM(payment.amount)
FROM staff
INNER JOIN payment ON
staff.staff_id=payment.staff_id
GROUP BY staff.staff_id;

-- 6c. Something is not working here. Join actor and film to get actor count by film
SELECT film.title AS "Title", COUNT(film_actor.actor_id) AS "Count"
FROM film
INNER JOIN film_actor
ON film.film_id=film_actor.film_id
GROUP BY film.title;

-- 6d. How many copies of the film `Hunchback Impossible` exist in the inventory system?
SELECT COUNT(inventory.inventory_id) AS "Count of Copies of Hunchback Impossible in Inventory"
FROM inventory
JOIN film
ON inventory.film_id=film.film_id
WHERE film.title = "Hunchback Impossible";

-- 6e. Using the tables `payment` and `customer` and the `JOIN` command, list the total paid by each customer. List the customers alphabetically by last name:
SELECT customer.first_name, customer.last_name, SUM(payment.amount) AS "Total payments by Customer"
FROM payment
JOIN customer
ON customer.customer_id=payment.customer_id
GROUP BY customer.last_name
ORDER BY customer.last_name;

-- 7a. Use subqueries to display the titles of movies starting with the letters `K` and `Q` whose language is English.
SELECT film.title AS "Title beginning with K or Q" 
FROM film
WHERE film.title IN
    (SELECT film.title
    FROM film
    WHERE film.title LIKE "K%"
    OR film.title LIKE "Q%");

-- 7b. Use subqueries to display all actors who appear in the film `Alone Trip`.
SELECT actor.first_name, actor.last_name 
FROM actor
WHERE actor.actor_id IN
    (SELECT film_actor.actor_id
    FROM film_actor
    WHERE film_actor.film_id IN
		(SELECT film.film_id
		FROM film
		WHERE film.title = "Alone Trip"
        )
	);

/*7c. You want to run an email marketing campaign in Canada, 
for which you will need the names and email addresses of all Canadian customers. Use joins to retrieve this information.*/
SELECT customer.first_name, customer.last_name, customer.email
FROM customer
JOIN address
ON customer.address_id=address.address_id
JOIN city 
ON address.city_id=city.city_id
JOIN country
ON city.country_id=country.country_id
WHERE country = "Canada";

/* 7d. Sales have been lagging among young families, and you wish to target all family movies for a promotion. 
Identify all movies categorized as family films.*/
SELECT film.title
FROM film
JOIN film_category
ON film.film_id=film_category.film_id
JOIN category
ON film_category.category_id=category.category_id
WHERE name = "Family";

-- 7e. Display the most frequently rented movies in descending order
SELECT film.title, COUNT(film.title) AS "Rental Count"
FROM film
JOIN inventory
ON film.film_id=inventory.film_id
JOIN rental
ON inventory.inventory_id=rental.inventory_id
GROUP BY film.title
ORDER BY COUNT(film.title) desc;

-- 7f. Write a query to display how much business, in dollars, each store brought in.
SELECT store.store_id AS "Store", SUM(payment.amount) AS "Total Business"
FROM store
JOIN staff
ON store.store_id=staff.store_id
JOIN payment
ON staff.staff_id=payment.staff_id
GROUP BY store.store_id;

-- 7g. Write a query to display for each store its store ID, city, and country.
SELECT store.store_id, city.city, country.country
FROM store
JOIN address
ON store.address_id=address.address_id
JOIN city
ON address.city_id=city.city_id
JOIN country
ON city.country_id=country.country_id;

/*7h. List the top five genres in gross revenue in descending order. 
(**Hint**: you may need to use the following tables: category, film_category, inventory, payment, and rental.)*/
SELECT category.name AS "Genre", SUM(payment.amount) AS "Total Sales"
FROM category
JOIN film_category
ON category.category_id=film_category.category_id
JOIN inventory
ON inventory.film_id=film_category.film_id
JOIN rental
ON rental.inventory_id=inventory.inventory_id
JOIN payment
ON payment.rental_id=rental.rental_id
GROUP BY category.name
ORDER BY SUM(payment.amount) DESC LIMIT 5;

/*8a. In your new role as an executive, you would like to have an easy way of viewing the Top five genres by gross revenue. 
Use the solution from the problem above to create a view. If you haven't solved 7h, you can substitute another query to create a view.*/
CREATE VIEW Top_Genres AS
SELECT category.name AS "Genre", SUM(payment.amount) AS "Total Sales"
FROM category
JOIN film_category
ON category.category_id=film_category.category_id
JOIN inventory
ON inventory.film_id=film_category.film_id
JOIN rental
ON rental.inventory_id=inventory.inventory_id
JOIN payment
ON payment.rental_id=rental.rental_id
GROUP BY category.name
ORDER BY SUM(payment.amount) DESC LIMIT 5;

-- 8b. How would you display the view that you created in 8a?
SELECT * FROM Top_Genres;

-- 8c. You find that you no longer need the view `top_five_genres`. Write a query to delete it.
DROP VIEW Top_Genres;