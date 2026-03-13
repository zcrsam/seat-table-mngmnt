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
        Schema::create('seats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('venue_id')->constrained()->onDelete('cascade');
            $table->string('table_number');
            $table->string('seat_number')->nullable();
            $table->integer('x_position');
            $table->integer('y_position');
            $table->enum('status', ['available', 'reserved', 'maintenance'])->default('available');
            $table->foreignId('reservation_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamps();
            
            $table->index(['venue_id', 'table_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seats');
    }
};
