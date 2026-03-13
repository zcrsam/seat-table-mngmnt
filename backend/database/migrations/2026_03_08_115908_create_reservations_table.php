<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->string('reference_code')->unique();
            $table->string('name');
            $table->string('email');
            $table->string('phone');
            $table->foreignId('venue_id')->constrained()->onDelete('cascade');
            $table->string('table_number')->nullable();
            $table->string('seat_number')->nullable();
            $table->integer('guests_count');
            $table->dateTime('event_date');
            $table->string('event_time');
            $table->text('special_requests')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'reserved'])->default('pending');
            $table->enum('type', ['whole', 'individual'])->default('whole');
            $table->timestamp('submitted_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
